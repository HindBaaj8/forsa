// database/migrations/2024_xx_xx_xxxxxx_create_requests_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('set null');
            $table->foreignId('worker_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('city');
            $table->decimal('budget', 10, 2)->nullable();
            $table->decimal('final_price', 10, 2)->nullable();
            $table->enum('status', ['pending', 'active', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('category');
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};