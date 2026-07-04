<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * goalsにアーカイブ日時を追加する
 * アーカイブした目標を「アーカイブ日まで存在していた」ものとして
 * 過去の統計・日別表示に残すために使う。
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('is_active');
        });

        // 既存のアーカイブ済み目標はアーカイブ日時が不明のため、
        // 最終更新日時（アーカイブ操作の時刻である可能性が最も高い）で補完する
        DB::table('goals')
            ->where('is_active', false)
            ->update(['archived_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
