<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'first_name' => 'أحمد',
            'last_name' => 'المدير',
            'email' => 'admin@test.com',
            'phone' => '0612345690',
            'city' => 'الدار البيضاء',
            'role' => 'admin',
            'status' => 'active',
            'password' => Hash::make('admin123'),
        ]);

        // Client
        User::create([
            'first_name' => 'أحمد',
            'last_name' => 'العلوي',
            'email' => 'client@test.com',
            'phone' => '0612345678',
            'city' => 'الدار البيضاء',
            'role' => 'client',
            'status' => 'active',
            'password' => Hash::make('12345678'),
        ]);

        // Worker
        User::create([
            'first_name' => 'كريم',
            'last_name' => 'السوسي',
            'email' => 'worker@test.com',
            'phone' => '0612345680',
            'city' => 'مراكش',
            'role' => 'worker',
            'status' => 'active',
            'password' => Hash::make('12345678'),
        ]);

        // Utilisateurs supplémentaires pour tester
        User::create([
            'first_name' => 'فاطمة',
            'last_name' => 'الزهراء',
            'email' => 'fatima@test.com',
            'phone' => '0612345681',
            'city' => 'الرباط',
            'role' => 'client',
            'status' => 'active',
            'password' => Hash::make('12345678'),
        ]);

        User::create([
            'first_name' => 'محمد',
            'last_name' => 'العزيز',
            'email' => 'mohamed@test.com',
            'phone' => '0612345682',
            'city' => 'طنجة',
            'role' => 'worker',
            'status' => 'pending',
            'password' => Hash::make('12345678'),
        ]);
    }
}