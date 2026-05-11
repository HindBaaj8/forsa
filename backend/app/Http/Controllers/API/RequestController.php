<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Request;
use App\Models\Service;
use App\Events\DataUpdated;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Validator;

class RequestController extends Controller
{
    // جلب طلبات العميل
    public function clientRequests(HttpRequest $request)
    {
        $requests = Request::with(['client', 'worker', 'service'])
            ->where('client_id', $request->user()->id)
            ->latest()
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }
    
    // جلب طلبات العامل (اللي كلف بيه)
    public function workerRequests(HttpRequest $request)
    {
        $requests = Request::with(['client', 'worker', 'service'])
            ->where('worker_id', $request->user()->id)
            ->latest()
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }
    
    // إنشاء طلب جديد (عميل)
    public function store(HttpRequest $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'budget' => 'nullable|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $newRequest = Request::create([
            'client_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'city' => $request->city,
            'budget' => $request->budget,
            'status' => 'pending',
        ]);
        
        // ✅ إشعار للعميل (صاحب الطلب)
        broadcast(new DataUpdated(
            $request->user()->id,
            'request_created',
            'تم إنشاء طلب جديد بنجاح',
            $newRequest
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Request created successfully',
            'data' => $newRequest
        ], 201);
    }
    
    // تغيير حالة الطلب
    public function updateStatus(HttpRequest $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,active,in_progress,completed,cancelled',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $req = Request::findOrFail($id);
        
        // التحقق من الصلاحية (العميل ولا العامل)
        if ($req->client_id !== $request->user()->id && $req->worker_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $oldStatus = $req->status;
        $req->status = $request->status;
        $req->save();
        
        // ✅ إشعار لكل من العميل والعامل
        // إشعار للعميل
        broadcast(new DataUpdated(
            $req->client_id,
            'request_updated',
            'تم تحديث حالة الطلب رقم ' . $req->id . ' إلى ' . $request->status,
            $req
        ));
        
        // إشعار للعامل إذا موجود
        if ($req->worker_id) {
            broadcast(new DataUpdated(
                $req->worker_id,
                'request_updated',
                'تم تحديث حالة الطلب رقم ' . $req->id,
                $req
            ));
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Request status updated',
            'data' => $req
        ]);
    }
    
    // تعيين عامل للطلب (العميل فقط)
    public function assignWorker(HttpRequest $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'worker_id' => 'required|exists:users,id',
            'final_price' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $req = Request::findOrFail($id);
        
        // فقط العميل صاحب الطلب يقدر يعين عامل
        if ($req->client_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $req->worker_id = $request->worker_id;
        $req->final_price = $request->final_price;
        $req->status = 'active';
        $req->save();
        
        // ✅ إشعار للعامل المعين
        broadcast(new DataUpdated(
            $request->worker_id,
            'order_created',
            'تم تعيينك للطلب رقم ' . $req->id,
            $req
        ));
        
        // ✅ إشعار للعميل
        broadcast(new DataUpdated(
            $request->user()->id,
            'request_updated',
            'تم تعيين عامل للطلب رقم ' . $req->id,
            $req
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Worker assigned successfully',
            'data' => $req
        ]);
    }
    
    // حذف طلب (العميل فقط، الطلب pending)
    public function destroy(HttpRequest $request, $id)
    {
        $req = Request::findOrFail($id);
        
        if ($req->client_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        if ($req->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete active request'
            ], 422);
        }
        
        $req->delete();
        
        // ✅ إشعار للعميل بحذف الطلب
        broadcast(new DataUpdated(
            $request->user()->id,
            'request_cancelled',
            'تم حذف الطلب رقم ' . $id,
            ['id' => $id]
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Request deleted successfully'
        ]);
    }
    
    // تفاصيل طلب معين
    public function show($id)
    {
        $request = Request::with(['client', 'worker', 'service'])
            ->findOrFail($id);
            
        return response()->json([
            'status' => 'success',
            'data' => $request
        ]);
    }
}