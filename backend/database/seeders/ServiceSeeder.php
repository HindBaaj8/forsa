<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // جلب مستخدم worker (كريم السوسي)
        $worker = User::where('email', 'worker@test.com')->first();
        
        if ($worker) {
            Service::create([
                'worker_id' => $worker->id,
                'title' => 'تركيب وإصلاح المكيفات',
                'description' => 'خدمة تركيب وصيانة جميع أنواع المكيفات، خبرة 5 سنوات',
                'category' => 'كهرباء',
                'price' => 250,
                'city' => 'الدار البيضاء',
                'status' => 'active',
            ]);
            
            Service::create([
                'worker_id' => $worker->id,
                'title' => 'إصلاح التسربات',
                'description' => 'كشف وإصلاح جميع أنواع تسربات المياه',
                'category' => 'سباكة',
                'price' => 200,
                'city' => 'الدار البيضاء',
                'status' => 'active',
            ]);
        }
    }
}