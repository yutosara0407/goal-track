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

    /**
     * ユーザーIDは大文字小文字を区別しないため、小文字に正規化してから検証・保存する。
     * null・空文字は「未設定」として必ずnullに統一する（空文字のまま保存すると、
     * 複数ユーザーが未設定にした際にUNIQUE制約へ衝突してしまうため）
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('username')) {
            $username = $this->input('username');
            $this->merge([
                'username' => ($username === null || $username === '') ? null : strtolower((string) $username),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'username' => [
                'nullable', 'string', 'regex:/^[a-z0-9_.-]{1,10}$/',
                Rule::unique('users', 'username')->ignore($this->user()->id),
            ],
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
            'name.required'   => '名前は必須です',
            'username.regex'  => 'ユーザーIDは半角英数字・_・.・-のみ、10文字以内で入力してください',
            'username.unique' => 'このユーザーIDは既に使用されています',
            'email.required'  => 'メールアドレスは必須です',
            'email.email'     => '有効なメールアドレスを入力してください',
            'email.unique'    => 'このメールアドレスは既に使用されています',
            'bio.max'         => '自己紹介は500文字以内で入力してください',
        ];
    }
}
