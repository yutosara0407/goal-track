<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompletionController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| 認証不要なルート: 登録・ログイン
| 認証必要なルート: sanctum:auth ミドルウェアで保護
*/

// 認証不要のルート
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// 認証必須のルート（Bearerトークンが必要）
Route::middleware('auth:sanctum')->group(function () {

    // 認証ユーザー情報
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // 目標のCRUD
    Route::apiResource('goals', GoalController::class);

    // 達成記録
    Route::get('/completions', [CompletionController::class, 'index']);       // 指定日の達成状況一覧
    Route::post('/completions/toggle', [CompletionController::class, 'toggle']); // 達成トグル
    Route::get('/completions/history', [CompletionController::class, 'history']); // 履歴取得

    // 統計・分析
    Route::get('/stats/overview', [StatsController::class, 'overview']); // ダッシュボード用サマリー
    Route::get('/stats/monthly', [StatsController::class, 'monthly']);   // 月次カレンダーデータ

    // メール送信状況
    Route::get('/email/status', [EmailController::class, 'status']);
});
