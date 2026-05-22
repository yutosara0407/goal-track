<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 目標モデル
 * ユーザーが登録する日々の目標を表す
 */
class Goal extends Model
{
    use HasFactory;

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'color',
        'is_active',
    ];

    /**
     * カラムの型キャスト
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * この目標を所有するユーザー
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * この目標の全達成記録
     */
    public function completions(): HasMany
    {
        return $this->hasMany(GoalCompletion::class);
    }

    /**
     * 指定日の達成記録を取得する
     *
     * @param string $date YYYY-MM-DD形式の日付
     */
    public function completionForDate(string $date): ?GoalCompletion
    {
        return $this->completions()->where('date', $date)->first();
    }

    /**
     * 指定期間の達成率を計算する
     *
     * @param string $from 開始日
     * @param string $to 終了日
     * @return float 0.0〜1.0の達成率
     */
    public function completionRateForPeriod(string $from, string $to): float
    {
        $totalDays = \Carbon\Carbon::parse($from)->diffInDays(\Carbon\Carbon::parse($to)) + 1;
        $completedDays = $this->completions()
            ->whereBetween('date', [$from, $to])
            ->where('completed', true)
            ->count();

        return $totalDays > 0 ? round($completedDays / $totalDays, 4) : 0.0;
    }

    /**
     * 現在の連続達成日数（ストリーク）を計算する
     * 今日から遡って、連続して達成している日数を返す
     */
    public function currentStreak(): int
    {
        $streak = 0;
        $date = now()->toDateString();

        // 達成記録を降順で取得
        $completions = $this->completions()
            ->where('completed', true)
            ->where('date', '<=', $date)
            ->orderByDesc('date')
            ->pluck('date');

        foreach ($completions as $index => $completionDate) {
            $expected = now()->subDays($index)->toDateString();
            if ($completionDate === $expected) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
