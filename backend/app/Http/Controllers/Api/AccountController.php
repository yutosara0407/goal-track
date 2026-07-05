<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\DeleteAccountRequest;
use App\Http\Requests\Account\UpdatePasswordRequest;
use App\Http\Requests\Account\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * アカウント管理コントローラー
 * ログイン中ユーザーのプロフィール更新・パスワード変更・退会を処理する
 */
class AccountController extends Controller
{
    /**
     * プロフィール（名前・ユーザーID・メールアドレス等）を更新する
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->only('name', 'username', 'email', 'bio', 'is_public'));

        return response()->json($user);
    }

    /**
     * パスワードを変更する
     * 現在のパスワードを照合し、変更後は他デバイスのトークンを無効化する
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['現在のパスワードが正しくありません'],
            ]);
        }

        $user->password = $request->password; // Hashedキャストで自動ハッシュ化
        $user->save();

        // 現在のセッションは維持し、他デバイスのトークンのみ無効化
        $user->tokens()
            ->where('id', '!=', $user->currentAccessToken()->id)
            ->delete();

        return response()->json(['message' => 'パスワードを変更しました']);
    }

    /**
     * アカウントを削除する（退会）
     * 目標・達成記録はDBの外部キー制約でカスケード削除される
     */
    public function destroy(DeleteAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['パスワードが正しくありません'],
            ]);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'アカウントを削除しました。ご利用ありがとうございました']);
    }
}
