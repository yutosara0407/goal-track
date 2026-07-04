<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

/**
 * パスワード変更リクエストのバリデーション
 * 現在のパスワードの照合はコントローラーで行う
 */
class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed', 'different:current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => '現在のパスワードは必須です',
            'password.required'         => '新しいパスワードは必須です',
            'password.min'              => 'パスワードは8文字以上で入力してください',
            'password.confirmed'        => 'パスワードが一致しません',
            'password.different'        => '新しいパスワードは現在のパスワードと別のものにしてください',
        ];
    }
}
