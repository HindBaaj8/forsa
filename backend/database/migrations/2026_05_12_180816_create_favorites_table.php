<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('favorites')) {
            Schema::create('favorites', function (Blueprint $table) {
                $table->id();
                $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                
                $table->unique(['client_id', 'worker_id']);
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('favorites');
    }
};