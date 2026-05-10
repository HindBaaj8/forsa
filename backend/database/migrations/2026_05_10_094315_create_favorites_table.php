// database/migrations/2024_xx_xx_xxxxxx_create_favorites_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['client_id', 'worker_id']);
            $table->index('client_id');
            $table->index('worker_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};