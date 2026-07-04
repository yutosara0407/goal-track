<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ソーシャル機能のマイグレーション
 * - users: 自己紹介(bio)と公開設定(is_public)を追加
 * - follows: フォロー関係（follower → followee）
 *
 * 公開プロフィールで見えるのは名前・bio・集計統計のみ。
 * 目標のタイトルやメモ、メールアドレスは公開されない。
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bio', 500)->nullable()->after('email');
            // true=検索に表示され、プロフィールの統計が閲覧可能
            $table->boolean('is_public')->default(true)->after('bio');
        });

        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('followee_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // 同じ相手を二重フォローできない
            $table->unique(['follower_id', 'followee_id']);
            $table->index('followee_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follows');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'is_public']);
        });
    }
};
