<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Message;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get user's reports
    public function index()
    {
        $reports = Report::where('reporter_id', auth()->id())
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }

    // Create a report
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reportable_type' => 'required|string|in:user,service,request,message',
            'reportable_id' => 'required|integer',
            'reason' => 'required|string|max:500',
        ]);

        // Check if reportable exists
        $modelClass = $this->getModelClass($validated['reportable_type']);
        $reportable = $modelClass::find($validated['reportable_id']);

        if (!$reportable) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // Check if already reported
        $existingReport = Report::where('reporter_id', auth()->id())
            ->where('reportable_type', $modelClass)
            ->where('reportable_id', $validated['reportable_id'])
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You already reported this item'], 422);
        }

        $report = Report::create([
            'reporter_id' => auth()->id(),
            'reportable_type' => $modelClass,
            'reportable_id' => $validated['reportable_id'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json($report, 201);
    }

    // Get report details (admin only)
    public function show(Report $report)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($report->load('reporter', 'reportable'));
    }

    // Get all reports (admin only)
    public function all()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reports = Report::with('reporter')
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }

    // Resolve report (admin only)
    public function resolve(Report $report)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $report->update([
            'status' => 'resolved',
            'admin_notes' => request()->admin_notes,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Report resolved']);
    }

    // Dismiss report (admin only)
    public function dismiss(Report $report)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $report->update([
            'status' => 'dismissed',
            'admin_notes' => request()->admin_notes,
        ]);

        return response()->json(['message' => 'Report dismissed']);
    }

    private function getModelClass($type)
    {
        $models = [
            'user' => User::class,
            'service' => Service::class,
            'request' => ServiceRequest::class,
            'message' => Message::class,
        ];

        return $models[$type];
    }
}