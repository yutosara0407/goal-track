<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('plan', ['free', 'premium'])->default('free')->after('email');
            $table->unsignedInteger('email_send_count')->default(0)->after('plan');
            $table->timestamp('email_send_reset_at')->nullable()->after('email_send_count');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan', 'email_send_count', 'email_send_reset_at']);
        });
    }
};
