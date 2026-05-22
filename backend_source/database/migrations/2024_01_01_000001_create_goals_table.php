<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * goalsテーブルのマイグレーション
 * ユーザーが登録する「目標」を管理するテーブル
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            // 外部キー: どのユーザーの目標か
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // 目標のタイトル（例: "毎日30分読書する"）
            $table->string('title');
            // 目標の詳細説明（任意）
            $table->text('description')->nullable();
            // カレンダーやカード表示に使うアクセントカラー（HEXコード）
            $table->string('color', 7)->default('#6366f1');
            // アーカイブ済みかどうか（削除せず非表示にする場合）
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
