<?php

namespace App\Http\Requests\Goal;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 目標作成リクエストのバリデーション
 */
class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            // カラーコードはHEX形式（例: #6366f1）
            'color'       => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '目標タイトルは必須です',
            'title.max'      => '目標タイトルは100文字以内で入力してください',
            'color.regex'    => 'カラーコードは#RRGGBBの形式で入力してください',
        ];
    }
}
