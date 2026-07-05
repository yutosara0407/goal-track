<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ユーザーIDの桁数上限を10文字から20文字に拡大する
 *
 * 実際の文字数制限はアプリ層のバリデーション（RegisterRequest/UpdateProfileRequestの
 * regex）が担っており、この列長はスキーマ上の意図の明示（および将来MySQL/Postgres等へ
 * 移行した場合の実効的な制約）のためのもの。SQLiteはVARCHAR(n)の長さを強制しないため、
 * 既存データへの影響はない。
 *
 * 注意: 既にUNIQUEインデックスが張られているカラムをchange()する際、
 * Blueprint側で再度unique()を宣言すると「テーブル再作成時に自動継承される既存インデックス」
 * と重複してCREATE UNIQUE INDEXが二重実行されエラーになる。再宣言しないこと。
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 10)->nullable()->change();
        });
    }
};
