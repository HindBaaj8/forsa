<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {
            // الأعمدة الموجودة بالفعل في جدولك
            if (!Schema::hasColumn('notifications', 'body')) {
                $table->text('body')->nullable()->after('title');
            }
            
            if (!Schema::hasColumn('notifications', 'action_url')) {
                $table->string('action_url')->nullable()->after('data');
            }
            
            if (!Schema::hasColumn('notifications', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('action_url');
            }
        });
    }

    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'body')) {
                $table->dropColumn('body');
            }
            if (Schema::hasColumn('notifications', 'action_url')) {
                $table->dropColumn('action_url');
            }
            if (Schema::hasColumn('notifications', 'read_at')) {
                $table->dropColumn('read_at');
            }
        });
    }
};