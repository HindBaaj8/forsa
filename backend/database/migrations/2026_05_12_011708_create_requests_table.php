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
        Schema::create('requests', function (Blueprint $table) {
    $table->id();

    $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');

    $table->string('title');
    $table->text('description');

    $table->decimal('budget', 10, 2);
    $table->string('city');

    $table->enum('visibility', ['public', 'workers_only'])->default('public');
    $table->enum('status', ['pending', 'in_discussion', 'completed', 'cancelled'])->default('pending');

    $table->timestamps();

    $table->index(['client_id', 'status']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
