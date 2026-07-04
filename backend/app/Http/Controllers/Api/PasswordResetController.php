<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

/**
 * パスワード再設定コントローラー
 * メールでの再設定リンク送信と、トークンによる再設定を処理する
 */
class PasswordResetController extends Controller
{
    /**
     * 再設定リンクをメール送信する
     * アカウントの有無を推測されないよう、結果に関わらず同じメッセージを返す
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'このメールアドレスが登録されている場合、パスワード再設定用のメールを送信しました',
        ]);
    }

    /**
     * トークンを検証して新しいパスワードを設定する
     * 成功時は全APIトークンを無効化し、再ログインを促す
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = $password; // Hashedキャストで自動ハッシュ化
                $user->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['再設定リンクが無効か、有効期限が切れています。もう一度メールを送信してください'],
            ]);
        }

        return response()->json([
            'message' => 'パスワードを再設定しました。新しいパスワードでログインしてください',
        ]);
    }
}
