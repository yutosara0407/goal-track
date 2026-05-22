<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * 認証コントローラー
 * ユーザーの登録・ログイン・ログアウトを処理する
 */
class AuthController extends Controller
{
    /**
     * 新規ユーザー登録
     * バリデーション後、ユーザーを作成してAPIトークンを返す
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password, // HashedによりBcryptで自動ハッシュ化
        ]);

        // デバイス名をトークン名に使用（複数デバイス管理のため）
        $token = $user->createToken('web-client')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * ログイン処理
     * メールアドレスとパスワードを検証してAPIトークンを返す
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Auth::attemptで認証情報を検証
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['メールアドレスまたはパスワードが正しくありません'],
            ]);
        }

        $user = Auth::user();

        // 既存のトークンをすべて削除して新しいトークンを発行
        // （セキュリティ: 以前のセッションを無効化）
        $user->tokens()->delete();
        $token = $user->createToken('web-client')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * ログアウト処理
     * 現在のAPIトークンを無効化する
     */
    public function logout(Request $request): JsonResponse
    {
        // 現在のリクエストで使用しているトークンのみ削除
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'ログアウトしました']);
    }

    /**
     * 認証済みユーザーの情報を返す
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
