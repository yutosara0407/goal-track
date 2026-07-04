<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompletionController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\UserController;
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
// ブルートフォース対策として、IPごとの試行回数をthrottleで制限する
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:password-email');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:password-reset');
});

// 認証必須のルート（Bearerトークンが必要）
Route::middleware('auth:sanctum')->group(function () {

    // 認証ユーザー情報
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // アカウント管理
    Route::put('/auth/profile', [AccountController::class, 'updateProfile']);     // プロフィール更新
    Route::put('/auth/password', [AccountController::class, 'updatePassword']);   // パスワード変更
    Route::delete('/auth/account', [AccountController::class, 'destroy']);        // 退会

    // ソーシャル（/users/search は {user} バインディングより先に定義すること）
    Route::get('/users/search', [UserController::class, 'search']);               // 公開ユーザー検索
    Route::get('/users/{user}', [UserController::class, 'show']);                 // 公開プロフィール
    Route::get('/users/{user}/followers', [UserController::class, 'followers']);  // フォロワー一覧
    Route::get('/users/{user}/following', [UserController::class, 'following']);  // フォロー中一覧
    Route::post('/users/{user}/follow', [UserController::class, 'follow']);       // フォロー
    Route::delete('/users/{user}/follow', [UserController::class, 'unfollow']);   // フォロー解除

    // 目標のCRUD
    Route::apiResource('goals', GoalController::class);

    // 達成記録
    Route::get('/completions', [CompletionController::class, 'index']);       // 指定日の達成状況一覧
    Route::post('/completions/toggle', [CompletionController::class, 'toggle']); // 達成トグル
    Route::get('/completions/history', [CompletionController::class, 'history']); // 履歴取得
    Route::delete('/completions/{completion}', [CompletionController::class, 'destroy']); // 達成記録削除

    // 統計・分析
    Route::get('/stats/overview', [StatsController::class, 'overview']); // ダッシュボード用サマリー
    Route::get('/stats/monthly', [StatsController::class, 'monthly']);   // 月次カレンダーデータ
});
