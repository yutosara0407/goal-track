<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * タイムライン機能のマイグレーション
 * - users: 実績をフォロワーのタイムラインに公開するか、noteも含めて公開するかの設定
 * - daily_notes: ユーザー単位の日記（目標ごとのgoal_completions.noteとは別物）
 *
 * 公開設定はis_public（検索・プロフィール閲覧の可否）とは独立した項目。
 * 既存ユーザーはデフォルトfalse（オプトイン）から開始する。
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('share_timeline')->default(false)->after('is_public');
            $table->boolean('share_timeline_notes')->default(false)->after('share_timeline');
        });

        Schema::create('daily_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->text('body');
            $table->timestamps();

            // 同じユーザーの同じ日のノートは1件のみ
            $table->unique(['user_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_notes');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['share_timeline', 'share_timeline_notes']);
        });
    }
};
