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
     * この目標が集計対象になる開始日（= 作成日）
     * 作成前の日付を「未達成」として数えないための基準
     */
    public function startDate(): string
    {
        return $this->created_at->toDateString();
    }

    /**
     * 指定期間のうち、この目標が存在していた日数を返す
     * （作成日より前の日は集計対象外）
     */
    public function eligibleDaysBetween(string $from, string $to): int
    {
        $start = max($from, $this->startDate());
        if ($start > $to) {
            return 0;
        }
        return \Carbon\Carbon::parse($start)->diffInDays(\Carbon\Carbon::parse($to)) + 1;
    }

    /**
     * 指定期間の達成率を計算する（目標が存在していた日数が分母）
     *
     * @param string $from 開始日
     * @param string $to 終了日
     * @return float 0.0〜1.0の達成率
     */
    public function completionRateForPeriod(string $from, string $to): float
    {
        $totalDays = $this->eligibleDaysBetween($from, $to);
        $completedDays = $this->completions()
            ->whereBetween('date', [$from, $to])
            ->where('completed', true)
            ->count();

        return $totalDays > 0 ? round($completedDays / $totalDays, 4) : 0.0;
    }

    /**
     * 現在の連続達成日数（ストリーク）を計算する
     * 今日（未記録なら昨日）から遡って、連続して達成している日数を返す。
     * 今日まだチェックしていなくてもストリークは途切れない扱いにする。
     *
     * 注意: date列はCarbonキャストのため、比較は必ずtoDateString()で行うこと
     * （Carbonと文字列の === 比較は常にfalseになる）
     */
    public function currentStreak(): int
    {
        $today = now()->toDateString();

        // 達成日（Y-m-d文字列）を新しい順に取得
        $dates = $this->completions()
            ->where('completed', true)
            ->where('date', '<=', $today)
            ->orderByDesc('date')
            ->pluck('date')
            ->map(fn($d) => $d->toDateString())
            ->unique()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        // 起点は「今日」または「昨日」（今日が未達成でも昨日までの連続は有効）
        $anchor = $dates->first() === $today ? now() : now()->subDay();
        if ($dates->first() !== $anchor->toDateString()) {
            return 0;
        }

        $streak = 0;
        foreach ($dates as $index => $date) {
            if ($date === $anchor->copy()->subDays($index)->toDateString()) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
