<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Goal\StoreGoalRequest;
use App\Http\Requests\Goal\UpdateGoalRequest;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 目標管理コントローラー
 * CRUD操作を提供する。認証済みユーザーの目標のみ操作可能
 */
class GoalController extends Controller
{
    /**
     * 目標一覧の取得
     * アクティブな目標のみ返す（is_active=trueのもの）
     */
    public function index(Request $request): JsonResponse
    {
        $goals = $request->user()
            ->goals()
            ->when(
                // クエリパラメータ ?include_inactive=true が指定された場合は非アクティブも含む
                !$request->boolean('include_inactive'),
                fn($query) => $query->where('is_active', true)
            )
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($goals);
    }

    /**
     * 目標の新規作成
     */
    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = $request->user()->goals()->create([
            'title'       => $request->title,
            'description' => $request->description,
            'color'       => $request->color ?? '#6366f1',
        ]);

        return response()->json($goal, 201);
    }

    /**
     * 特定の目標の詳細取得
     * 他ユーザーの目標にはアクセスできない（ポリシーで制御）
     */
    public function show(Request $request, Goal $goal): JsonResponse
    {
        // 自分の目標かどうかを確認
        $this->authorize('view', $goal);

        return response()->json($goal);
    }

    /**
     * 目標の更新
     */
    public function update(UpdateGoalRequest $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);

        $data = $request->validated();

        // アーカイブ/復元の遷移でarchived_atを管理する
        // （アーカイブ日までは統計・過去の日別表示に存在していた扱いになる）
        if (array_key_exists('is_active', $data) && (bool) $data['is_active'] !== $goal->is_active) {
            $goal->archived_at = $data['is_active'] ? null : now();
        }

        $goal->fill($data)->save();

        return response()->json($goal);
    }

    /**
     * 目標の削除
     * 関連する達成記録もカスケード削除される（マイグレーションで設定済み）
     */
    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return response()->json(['message' => '目標を削除しました'], 204);
    }
}
