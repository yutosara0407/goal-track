<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GoalCompletion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ユーザーコントローラー（ソーシャル機能）
 * ユーザー検索・公開プロフィール・フォロー関係を扱う
 *
 * プライバシー方針:
 * - 公開されるのは名前・ユーザーID・bio・参加日・集計統計・実績バッジのみ
 * - メールアドレス・目標タイトル・メモは一切公開しない
 * - is_public=false のユーザーは検索に出ず、統計も閲覧不可
 *
 * 検索方針:
 * - ユーザーIDの前方一致のみで検索する（名前・bioでは検索できない）
 * - usernameが未設定（null）のユーザーは検索対象外
 */
class UserController extends Controller
{
    /**
     * 公開ユーザーをユーザーIDの前方一致で検索する
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate(
            ['q' => ['required', 'string', 'min:1', 'max:100']],
            ['q.required' => 'ユーザーIDを入力してください'],
        );

        // 先頭の@は入力の揺れとして許容し、大文字小文字も無視する
        $q = strtolower(ltrim($request->string('q'), '@'));
        $viewer = $request->user();

        $users = User::where('is_public', true)
            ->whereNotNull('username')
            ->whereKeyNot($viewer->id)
            ->where('username', 'like', "{$q}%")
            ->withCount('followers')
            ->orderByDesc('followers_count')
            ->limit(20)
            ->get();

        $followingIds = $viewer->following()->pluck('users.id')->all();

        return response()->json(
            $users->map(fn(User $u) => $this->publicSummary($u, in_array($u->id, $followingIds)))
        );
    }

    /**
     * 公開プロフィールを取得する
     * 非公開ユーザーは名前のみ（統計・bioは返さない）
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();
        $isSelf = $viewer->id === $user->id;
        $visible = $user->is_public || $isSelf;

        $payload = [
            'id'              => $user->id,
            'name'            => $user->name,
            'username'        => $user->username,
            'is_public'       => $user->is_public,
            'is_self'         => $isSelf,
            'is_following'    => $isSelf ? false : $viewer->isFollowing($user),
            'joined_at'       => $user->created_at->toDateString(),
            'bio'             => $visible ? $user->bio : null,
            'followers_count' => $visible ? $user->followers()->count() : null,
            'following_count' => $visible ? $user->following()->count() : null,
            'stats'           => $visible ? $this->profileStats($user) : null,
            'achievements'    => $visible ? $this->achievements($user) : null,
        ];

        return response()->json($payload);
    }

    /**
     * フォローする
     */
    public function follow(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();

        if ($viewer->id === $user->id) {
            return response()->json(['message' => '自分自身はフォローできません'], 422);
        }
        if (!$user->is_public) {
            return response()->json(['message' => 'このユーザーは非公開のためフォローできません'], 403);
        }

        // 二重フォローはUNIQUE制約があるため syncWithoutDetaching で冪等に
        $viewer->following()->syncWithoutDetaching([$user->id]);

        return response()->json([
            'message'         => "{$user->name}さんをフォローしました",
            'followers_count' => $user->followers()->count(),
        ]);
    }

    /**
     * フォローを解除する
     */
    public function unfollow(Request $request, User $user): JsonResponse
    {
        $request->user()->following()->detach($user->id);

        return response()->json([
            'message'         => 'フォローを解除しました',
            'followers_count' => $user->followers()->count(),
        ]);
    }

    /**
     * フォロワー一覧（公開ユーザーまたは本人のみ閲覧可）
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        return $this->relationList($request, $user, 'followers');
    }

    /**
     * フォロー中一覧（公開ユーザーまたは本人のみ閲覧可）
     */
    public function following(Request $request, User $user): JsonResponse
    {
        return $this->relationList($request, $user, 'following');
    }

    /**
     * followers / following 一覧の共通処理
     */
    private function relationList(Request $request, User $user, string $relation): JsonResponse
    {
        $viewer = $request->user();

        if (!$user->is_public && $viewer->id !== $user->id) {
            return response()->json(['message' => 'このユーザーは非公開です'], 403);
        }

        $users = $user->{$relation}()->withCount('followers')->orderByDesc('followers_count')->limit(100)->get();
        $followingIds = $viewer->following()->pluck('users.id')->all();

        return response()->json(
            $users->map(fn(User $u) => $this->publicSummary($u, in_array($u->id, $followingIds)))
        );
    }

    /**
     * 一覧表示用の公開サマリー（メールアドレスは含めない）
     */
    private function publicSummary(User $user, bool $isFollowing): array
    {
        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'username'        => $user->username,
            'bio'             => $user->bio,
            'is_public'       => $user->is_public,
            'followers_count' => $user->followers_count ?? $user->followers()->count(),
            'is_following'    => $isFollowing,
        ];
    }

    /**
     * プロフィール用の集計統計
     */
    private function profileStats(User $user): array
    {
        $goalIds = $user->goals()->pluck('id');

        $totalCompleted = GoalCompletion::whereIn('goal_id', $goalIds)
            ->where('completed', true)
            ->count();

        // 記録をつけた日数（達成・未達成問わず）
        $activeDays = GoalCompletion::whereIn('goal_id', $goalIds)
            ->distinct('date')
            ->count('date');

        $activeGoals = $user->activeGoals()->get();

        // アクティブ目標の現在ストリークの最大値
        $bestCurrentStreak = $activeGoals
            ->map(fn($goal) => $goal->currentStreak())
            ->max() ?? 0;

        // 今月の達成率（StatsController::overviewと同じ算式）
        // 分母は各目標が存在していた日数の合計（作成前・アーカイブ後の日は数えない）
        $monthStart = now()->startOfMonth()->toDateString();
        $today = now()->toDateString();
        $allGoals = $user->goals()->get();
        $goalsById = $allGoals->keyBy('id');
        $monthDenominator = $allGoals->sum(fn($goal) => $goal->eligibleDaysBetween($monthStart, $today));
        $monthCompleted = GoalCompletion::whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$monthStart, $today])
            ->where('completed', true)
            ->get(['goal_id', 'date'])
            ->filter(function ($c) use ($goalsById) {
                $goal = $goalsById->get($c->goal_id);
                return $goal && $goal->existsOn($c->date->toDateString());
            })
            ->count();

        return [
            'active_goals'          => $activeGoals->count(),
            'total_completed'       => $totalCompleted,
            'active_days'           => $activeDays,
            'best_current_streak'   => $bestCurrentStreak,
            'month_completion_rate' => $monthDenominator > 0
                ? round($monthCompleted / $monthDenominator, 4) : 0,
        ];
    }

    /**
     * 実績バッジの判定
     * フロントエンドはIDをもとにアイコン・ラベルを表示する
     */
    private function achievements(User $user): array
    {
        $stats = $this->profileStats($user);
        $goalsCreated = $user->goals()->count();

        $earned = [];

        // 達成数マイルストーン
        foreach ([['first_step', 1], ['committed_10', 10], ['dedicated_50', 50], ['centurion_100', 100], ['legend_365', 365]] as [$id, $threshold]) {
            if ($stats['total_completed'] >= $threshold) {
                $earned[] = $id;
            }
        }

        // 連続日数マイルストーン（現在のベストストリーク）
        foreach ([['streak_3', 3], ['streak_7', 7], ['streak_14', 14], ['streak_30', 30], ['streak_100', 100]] as [$id, $threshold]) {
            if ($stats['best_current_streak'] >= $threshold) {
                $earned[] = $id;
            }
        }

        // 目標設定マイルストーン
        foreach ([['goal_setter_3', 3], ['goal_architect_10', 10]] as [$id, $threshold]) {
            if ($goalsCreated >= $threshold) {
                $earned[] = $id;
            }
        }

        return $earned;
    }
}
