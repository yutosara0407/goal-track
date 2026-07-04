<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * プロフィール更新リクエストのバリデーション
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users')->ignore($this->user()->id),
            ],
            'bio'       => ['nullable', 'string', 'max:500'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => '名前は必須です',
            'email.required' => 'メールアドレスは必須です',
            'email.email'    => '有効なメールアドレスを入力してください',
            'email.unique'   => 'このメールアドレスは既に使用されています',
            'bio.max'        => '自己紹介は500文字以内で入力してください',
        ];
    }
}
