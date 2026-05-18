<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'type')) {
                $table->enum('type', ['featured', 'premium'])->default('featured')->after('id');
            }
            if (!Schema::hasColumn('payments', 'plan_id')) {
                $table->string('plan_id')->nullable()->after('type');
            }
            if (!Schema::hasColumn('payments', 'duration')) {
                $table->integer('duration')->default(1)->after('plan_id');
            }
            if (!Schema::hasColumn('payments', 'payment_url')) {
                $table->string('payment_url')->nullable()->after('transaction_id');
            }
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['type', 'plan_id', 'duration', 'payment_url']);
        });
    }
};