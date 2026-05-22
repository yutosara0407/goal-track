<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * goal_completionsテーブルのマイグレーション
 * 各目標の「日別達成記録」を管理するテーブル
 * 1目標 × 1日 = 1レコード（UNIQUE制約で重複防止）
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_completions', function (Blueprint $table) {
            $table->id();
            // どの目標の記録か
            $table->foreignId('goal_id')->constrained()->cascadeOnDelete();
            // 記録日（YYYY-MM-DD形式）
            $table->date('date');
            // その日に達成したかどうか
            $table->boolean('completed')->default(false);
            // 当日のメモ（例: "今日は少し大変だったが達成できた"）
            $table->text('note')->nullable();
            $table->timestamps();

            // 同じ目標の同じ日のレコードは1件のみ許可
            $table->unique(['goal_id', 'date']);
            // 日付での絞り込みを高速化するインデックス
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_completions');
    }
};
