<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\GoalCompletion;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 統計・分析コントローラー
 * ダッシュボードや履歴画面向けの集計データを提供する
 */
class StatsController extends Controller
{
    /**
     * ダッシュボード用のサマリー統計を取得する
     * 今日・今週・今月の達成率、ストリーク情報を含む
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $goals = $user->activeGoals()->get();
        $goalIds = $goals->pluck('id');

        if ($goals->isEmpty()) {
            return response()->json([
                'total_goals'            => 0,
                'active_goals'           => 0,
                'today_completed_count'  => 0,
                'today_completion_rate'  => 0,
                'week_completion_rate'   => 0,
                'month_completion_rate'  => 0,
                'current_streaks'        => [],
            ]);
        }

        // 今日の達成数
        $todayCompleted = GoalCompletion::whereIn('goal_id', $goalIds)
            ->where('date', $today)
            ->where('completed', true)
            ->count();

        // 今週の達成率
        // 分母は「各目標が存在していた日数」の合計（後から追加した目標の作成前の日を数えない）
        $weekDenominator = $goals->sum(fn(Goal $g) => $g->eligibleDaysBetween($weekStart, $today));
        $weekCompleted = GoalCompletion::whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$weekStart, $today])
            ->where('completed', true)
            ->count();

        // 今月の達成率（同上）
        $monthDenominator = $goals->sum(fn(Goal $g) => $g->eligibleDaysBetween($monthStart, $today));
        $monthCompleted = GoalCompletion::whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$monthStart, $today])
            ->where('completed', true)
            ->count();

        $goalCount = $goals->count();

        // 各目標の現在ストリーク（連続達成日数）を計算
        $streaks = $goals->map(function (Goal $goal) {
            return [
                'goal'   => $goal,
                'streak' => $goal->currentStreak(),
            ];
        })->sortByDesc('streak')->values();

        return response()->json([
            'total_goals'           => $user->goals()->count(),
            'active_goals'          => $goalCount,
            'today_completion_rate' => $goalCount > 0 ? round($todayCompleted / $goalCount, 4) : 0,
            'week_completion_rate'  => $weekDenominator > 0
                ? round($weekCompleted / $weekDenominator, 4) : 0,
            'month_completion_rate' => $monthDenominator > 0
                ? round($monthCompleted / $monthDenominator, 4) : 0,
            'today_completed_count' => $todayCompleted,
            'current_streaks'       => $streaks,
        ]);
    }

    /**
     * 月次カレンダー用データを取得する
     * 指定した年月の各日における達成状況を返す
     *
     * @query year 年（例: 2024）
     * @query month 月（1-12）
     */
    public function monthly(Request $request): JsonResponse
    {
        $year  = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $from = Carbon::create($year, $month, 1)->toDateString();
        $to   = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();

        $goals   = $request->user()->activeGoals()->get();
        $goalIds = $goals->pluck('id');
        $goalCount = $goals->count();

        if ($goalCount === 0) {
            return response()->json(['year' => $year, 'month' => $month, 'days' => [], 'goal_stats' => []]);
        }

        // 対象月の全達成記録を一括取得（N+1防止）
        // date列はCarbon castのため groupBy('date') だと "Y-m-d H:i:s" キーになる→明示的にY-m-dでグループ化
        $completions = GoalCompletion::whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$from, $to])
            ->get()
            ->groupBy(fn($c) => $c->date->format('Y-m-d'));

        // 月の各日のデータを生成
        $days = [];
        $current = Carbon::parse($from);
        $today = now()->toDateString();

        while ($current->toDateString() <= $to) {
            $dateStr = $current->toDateString();

            // 未来の日は集計しない
            if ($dateStr > $today) {
                $current->addDay();
                continue;
            }

            // その日時点で存在していた目標だけを分母にする
            $dayGoalCount = $goals->filter(fn(Goal $g) => $g->startDate() <= $dateStr)->count();

            $dayCompletions = $completions->get($dateStr, collect());
            $completedCount = $dayCompletions->where('completed', true)->count();

            $days[] = [
                'date'            => $dateStr,
                'completed_count' => $completedCount,
                'total_goals'     => $dayGoalCount,
                'completion_rate' => $dayGoalCount > 0 ? round($completedCount / $dayGoalCount, 4) : 0,
            ];

            $current->addDay();
        }

        // 目標ごとの月次統計（対象月に存在していなかった目標は含めない）
        $periodEnd = min($today, $to);
        $goalStats = $goals
            ->filter(fn(Goal $g) => $g->startDate() <= $periodEnd)
            ->values()
            ->map(function (Goal $goal) use ($completions, $from, $periodEnd) {
                $goalCompletions = $completions->flatten()
                    ->where('goal_id', $goal->id);

                $completedDays = $goalCompletions->where('completed', true)->count();
                // 分母は目標が存在していた日数のみ
                $totalDays = $goal->eligibleDaysBetween($from, $periodEnd);

                return [
                    'goal'            => $goal,
                    'completed_days'  => $completedDays,
                    'total_days'      => $totalDays,
                    'completion_rate' => $totalDays > 0 ? round($completedDays / $totalDays, 4) : 0,
                    'current_streak'  => $goal->currentStreak(),
                ];
            });

        return response()->json([
            'year'       => $year,
            'month'      => $month,
            'days'       => $days,
            'goal_stats' => $goalStats,
        ]);
    }
}
