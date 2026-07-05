<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Note\UpsertDailyNoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 日次ノートコントローラー
 * ログイン中ユーザー自身の日記（1日1件、目標ごとのメモとは別物）を管理する
 */
class DailyNoteController extends Controller
{
    /**
     * 指定日の自分のノートを取得する（未記録の場合はbody=null）
     */
    public function show(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return response()->json(['message' => '無効な日付です'], 422);
        }

        $note = $request->user()->dailyNotes()->where('date', $date)->first();

        return response()->json([
            'date' => $date,
            'body' => $note?->body,
        ]);
    }

    /**
     * 指定日のノートを作成・更新する
     * 本文が空の場合はレコードを削除し「未記録」に戻す（upsert/削除の3状態）
     */
    public function upsert(UpsertDailyNoteRequest $request): JsonResponse
    {
        $user = $request->user();
        $body = trim((string) $request->body);

        if ($body === '') {
            $user->dailyNotes()->where('date', $request->date)->delete();

            return response()->json(['date' => $request->date, 'body' => null]);
        }

        $note = $user->dailyNotes()->updateOrCreate(
            ['date' => $request->date],
            ['body' => $body]
        );

        return response()->json([
            'date' => $note->date->format('Y-m-d'),
            'body' => $note->body,
        ]);
    }
}
