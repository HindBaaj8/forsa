<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('reports')) {
            Schema::create('reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
                $table->morphs('reportable');
                $table->text('reason');
                $table->enum('status', ['pending', 'reviewed', 'resolved'])->default('pending');
                $table->timestamps();
                $table->index('status');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
};