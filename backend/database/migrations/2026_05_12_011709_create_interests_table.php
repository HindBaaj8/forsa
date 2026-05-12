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
        Schema::create('interests', function (Blueprint $table) {
    $table->id();

    $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');

    $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');

    $table->text('message')->nullable();

    $table->timestamps();

    $table->unique(['worker_id', 'request_id']);
    $table->index('status');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interests');
    }
};
