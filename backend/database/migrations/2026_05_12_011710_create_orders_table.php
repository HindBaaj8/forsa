<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
    $table->id();

    $table->foreignId('request_id')->constrained('requests')->onDelete('cascade')->unique();
    $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');

    $table->decimal('agreed_price', 10, 2);

    $table->enum('status', [
        'accepted',
        'in_progress',
        'completed',
        'cancelled'
    ])->default('accepted');

    $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');

    $table->timestamp('accepted_at')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();

    $table->timestamps();

    $table->index(['client_id', 'worker_id', 'status']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
