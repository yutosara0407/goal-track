<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ユーザー登録リクエストのバリデーション
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * ユーザーIDは大文字小文字を区別しないため、小文字に正規化してから検証・保存する
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('username')) {
            $this->merge(['username' => strtolower((string) $this->input('username'))]);
        }
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'regex:/^[a-z0-9_.-]{1,20}$/', 'unique:users,username'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => '名前は必須です',
            'username.required'  => 'ユーザーIDは必須です',
            'username.regex'     => 'ユーザーIDは半角英数字・_・.・-のみ、20文字以内で入力してください',
            'username.unique'    => 'このユーザーIDは既に使用されています',
            'email.required'     => 'メールアドレスは必須です',
            'email.email'        => '有効なメールアドレスを入力してください',
            'email.unique'       => 'このメールアドレスは既に使用されています',
            'password.required'  => 'パスワードは必須です',
            'password.min'       => 'パスワードは8文字以上で入力してください',
            'password.confirmed' => 'パスワードが一致しません',
        ];
    }
}
