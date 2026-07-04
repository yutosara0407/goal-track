<?php

namespace App\Http\Requests\Completion;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 達成記録更新リクエストのバリデーション
 */
class UpdateCompletionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'goal_id'   => ['required', 'integer', 'exists:goals,id'],
            // YYYY-MM-DD形式の日付。過去日の記録は可、未来日は不可
            // （サーバーUTCとクライアントのタイムゾーン差を考慮して翌日まで許容）
            'date'      => ['required', 'date_format:Y-m-d', 'before_or_equal:' . now()->addDay()->toDateString()],
            'completed' => ['required', 'boolean'],
            'note'      => ['nullable', 'string', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'goal_id.required'     => '目標IDは必須です',
            'goal_id.exists'       => '指定した目標が見つかりません',
            'date.required'        => '日付は必須です',
            'date.date_format'     => '日付はYYYY-MM-DD形式で入力してください',
            'date.before_or_equal' => '未来の日付には記録できません',
            'completed.required'   => '達成状態は必須です',
        ];
    }
}
