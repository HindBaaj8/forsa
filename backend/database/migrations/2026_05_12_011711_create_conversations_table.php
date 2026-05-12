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
        Schema::create('conversations', function (Blueprint $table) {
    $table->id();

    $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

    $table->timestamp('last_message_at')->nullable();

    $table->timestamps();

    $table->unique(['client_id', 'worker_id', 'order_id']);
    $table->index(['client_id', 'worker_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
