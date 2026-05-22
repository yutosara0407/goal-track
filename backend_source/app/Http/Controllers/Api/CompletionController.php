<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Completion\UpdateCompletionRequest;
use App\Models\Goal;
use App\Models\GoalCompletion;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 達成記録コントローラー
 * 日々の目標達成チェックを管理する
 */
class CompletionController extends Controller
{
    /**
     * 指定日の全目標の達成状況を取得する
     * 達成記録がまだ存在しない目標も、未達成として含めて返す
     *
     * @query date YYYY-MM-DD（省略時は今日）
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        // 日付のバリデーション
        if (!$this->isValidDate($date)) {
            return response()->json(['message' => '無効な日付です'], 422);
        }

        // ユーザーのアクティブな目標を取得
        $goals = $request->user()->activeGoals()->orderBy('created_at')->get();

        // 各目標の達成記録を取得（DBへのN+1クエリを防ぐためEagerLoading）
        $completions = GoalCompletion::whereIn('goal_id', $goals->pluck('id'))
            ->where('date', $date)
            ->get()
            ->keyBy('goal_id'); // goal_idをキーにしてO(1)でアクセス可能に

        // 目標ごとの達成状況をレスポンス用に整形
        $result = $goals->map(function (Goal $goal) use ($completions, $date) {
            $completion = $completions->get($goal->id);
            return [
                'goal'      => $goal,
                'date'      => $date,
                'completed' => $completion?->completed ?? false,
                'note'      => $completion?->note,
                'completion_id' => $completion?->id,
            ];
        });

        return response()->json([
            'date'            => $date,
            'items'           => $result,
            'completion_rate' => $goals->count() > 0
                ? round($result->where('completed', true)->count() / $goals->count(), 4)
                : 0,
        ]);
    }

    /**
     * 目標の達成状態をトグル（切り替える）する
     * 記録が存在しない場合は作成、存在する場合は更新する（upsert方式）
     */
    public function toggle(UpdateCompletionRequest $request): JsonResponse
    {
        $goal = Goal::findOrFail($request->goal_id);

        // 自分の目標かどうかを確認
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        // updateOrCreate: レコードが存在すれば更新、なければ作成
        $completion = GoalCompletion::updateOrCreate(
            ['goal_id' => $request->goal_id, 'date' => $request->date],
            ['completed' => $request->completed, 'note' => $request->note]
        );

        return response()->json($completion);
    }

    /**
     * 指定期間の達成記録を取得する（履歴表示用）
     *
     * @query from 開始日（YYYY-MM-DD）
     * @query to 終了日（YYYY-MM-DD）
     * @query goal_id 特定目標のみ絞り込む場合に指定
     */
    public function history(Request $request): JsonResponse
    {
        $from = $request->query('from', now()->subDays(30)->toDateString());
        $to   = $request->query('to', now()->toDateString());

        $goalIds = $request->user()->goals()->pluck('id');

        $query = GoalCompletion::with('goal')
            ->whereIn('goal_id', $goalIds)
            ->whereBetween('date', [$from, $to])
            ->where('completed', true)
            ->orderByDesc('date');

        // 特定の目標に絞り込む場合
        if ($request->has('goal_id')) {
            $query->where('goal_id', $request->integer('goal_id'));
        }

        $completions = $query->get();

        return response()->json($completions);
    }

    /**
     * YYYY-MM-DD形式の日付かどうかを検証する
     */
    private function isValidDate(string $date): bool
    {
        try {
            Carbon::createFromFormat('Y-m-d', $date);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
