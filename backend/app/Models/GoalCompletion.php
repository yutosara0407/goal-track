<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 目標達成記録モデル
 * 特定の日に特定の目標を達成したかを記録する
 */
class GoalCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'date',
        'completed',
        'note',
    ];

    protected $casts = [
        'date'      => 'date:Y-m-d',
        'completed' => 'boolean',
    ];

    /**
     * この達成記録が属する目標
     */
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
