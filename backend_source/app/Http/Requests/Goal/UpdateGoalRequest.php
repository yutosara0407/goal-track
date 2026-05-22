<?php

namespace App\Http\Requests\Goal;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 目標更新リクエストのバリデーション
 */
class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'color'       => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active'   => ['sometimes', 'boolean'],
        ];
    }
}
