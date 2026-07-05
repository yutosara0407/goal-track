<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyNote;
use App\Models\Goal;
use App\Models\GoalCompletion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * タイムラインコントローラー
 * フォロー中で、かつ実績のタイムライン公開（share_timeline）を有効にしている
 * ユーザーの直近の達成状況とノートをまとめて返す。
 *
 * プライバシー方針:
 * - is_public（検索・プロフィール閲覧の可否）とは独立した設定
 * - 出すのは日別の「達成数/分母/達成率」の集計のみ。目標のタイトル・
 *   目標ごとのメモは一切含めない（既存の公開プロフィールと同じ方針）
 * - ノート本文はshare_timeline_notesが有効な相手のみ含める
 */
class TimelineController extends Controller
{
    /** 遡って集計する日数 */
    private const WINDOW_DAYS = 14;

    /** 返却するエントリの上限件数 */
    private const MAX_ENTRIES = 50;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();
        $since = now()->subDays(self::WINDOW_DAYS - 1)->toDateString();

        $followees = $user->following()->where('share_timeline', true)->get();

        $entries = collect();

        foreach ($followees as $followee) {
            $entries = $entries->merge($this->buildEntriesForUser($followee, $since, $today));
        }

        $sorted = $entries
            ->sortBy([
                ['date', 'desc'],
                ['completion_rate', 'desc'],
            ])
            ->values()
            ->take(self::MAX_ENTRIES);

        return response()->json($sorted);
    }

    /**
     * 1ユーザー分の日別エントリを組み立てる
     * 達成記録がある日 + note単独の日（達成0でも日記だけある日）の両方を含める
     */
    private function buildEntriesForUser(User $followee, string $since, string $today): Collection
    {
        $goals = $followee->goals()->get();
        if ($goals->isEmpty()) {
            return collect();
        }
        $goalIds = $goals->pluck('id');

        $completionsByDate = GoalCompletion::whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$since, $today])
            ->where('completed', true)
            ->get(['date'])
            ->groupBy(fn($c) => $c->date->format('Y-m-d'));

        $notesByDate = $followee->share_timeline_notes
            ? $followee->dailyNotes()
                ->whereBetween('date', [$since, $today])
                ->get()
                ->keyBy(fn(DailyNote $n) => $n->date->format('Y-m-d'))
            : collect();

        $userSummary = [
            'id'       => $followee->id,
            'name'     => $followee->name,
            'username' => $followee->username,
        ];

        $entries = collect();

        // 達成記録がある日
        foreach ($completionsByDate as $date => $group) {
            $dayGoalCount = $goals->filter(fn(Goal $g) => $g->existsOn($date))->count();
            if ($dayGoalCount === 0) {
                continue;
            }

            $entries->push([
                'user'             => $userSummary,
                'date'             => $date,
                'completed_count'  => $group->count(),
                'total_goals'      => $dayGoalCount,
                'completion_rate'  => round($group->count() / $dayGoalCount, 4),
                'note'             => optional($notesByDate->get($date))->body,
            ]);
        }

        // note単独の日（その日の達成記録は無いが日記だけ書いている）
        foreach ($notesByDate as $date => $note) {
            if ($completionsByDate->has($date)) {
                continue; // 上のループで既に追加済み
            }

            $dayGoalCount = $goals->filter(fn(Goal $g) => $g->existsOn($date))->count();

            $entries->push([
                'user'             => $userSummary,
                'date'             => $date,
                'completed_count'  => 0,
                'total_goals'      => $dayGoalCount,
                'completion_rate'  => 0.0,
                'note'             => $note->body,
            ]);
        }

        return $entries;
    }
}
