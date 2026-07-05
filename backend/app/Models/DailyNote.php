<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 日次ノートモデル
 * 目標ごとのGoalCompletion::noteとは異なり、ユーザー単位の日記（1日1件）
 */
class DailyNote extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'body',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
