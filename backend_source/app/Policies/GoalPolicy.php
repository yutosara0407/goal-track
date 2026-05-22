<?php

namespace App\Policies;

use App\Models\Goal;
use App\Models\User;

/**
 * 目標へのアクセス制御ポリシー
 * 自分の目標にしかアクセスできないことを保証する
 */
class GoalPolicy
{
    /**
     * 目標の閲覧権限チェック
     */
    public function view(User $user, Goal $goal): bool
    {
        return $user->id === $goal->user_id;
    }

    /**
     * 目標の更新権限チェック
     */
    public function update(User $user, Goal $goal): bool
    {
        return $user->id === $goal->user_id;
    }

    /**
     * 目標の削除権限チェック
     */
    public function delete(User $user, Goal $goal): bool
    {
        return $user->id === $goal->user_id;
    }
}
