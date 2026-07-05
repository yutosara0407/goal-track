<?php

namespace App\Http\Requests\Note;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 日次ノート作成・更新リクエストのバリデーション
 */
class UpsertDailyNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // YYYY-MM-DD形式の日付。過去日は可、未来日は不可
            // （サーバーUTCとクライアントのタイムゾーン差を考慮して翌日まで許容）
            'date' => ['required', 'date_format:Y-m-d', 'before_or_equal:' . now()->addDay()->toDateString()],
            'body' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required'        => '日付は必須です',
            'date.date_format'     => '日付はYYYY-MM-DD形式で入力してください',
            'date.before_or_equal' => '未来の日付には記録できません',
            'body.max'             => 'ノートは1000文字以内で入力してください',
        ];
    }
}
