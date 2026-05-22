/**
 * 目標管理ページ
 * 目標の追加・編集・削除・アーカイブ操作ができる
 */
'use client';

import { useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useGoals, useGoalMutations } from '@/hooks/useGoals';
import { Goal, GoalFormData } from '@/types';

export default function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // データ取得
  const { data: goals, isLoading } = useGoals(showInactive);

  // CRUD操作フック
  const { createMutation, updateMutation, deleteMutation, archiveMutation } = useGoalMutations();

  // アクティブ・アーカイブ済みを分類
  const activeGoals = goals?.filter((g) => g.is_active) ?? [];
  const inactiveGoals = goals?.filter((g) => !g.is_active) ?? [];

  /** 目標作成フォーム送信 */
  const handleCreate = async (data: GoalFormData) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  /** 目標更新フォーム送信 */
  const handleUpdate = async (data: GoalFormData) => {
    if (!editingGoal) return;
    await updateMutation.mutateAsync({ id: editingGoal.id, data });
    setEditingGoal(null);
  };

  /** 目標削除確認 */
  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    await deleteMutation.mutateAsync(deletingGoal.id);
    setDeletingGoal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo size={24} className="text-primary-600" />
            目標管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            日々クリアしたい目標を登録・管理できます
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          目標を追加
        </Button>
      </div>

      {/* 目標一覧 */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* アクティブな目標 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                アクティブ ({activeGoals.length})
              </h2>
            </div>

            {activeGoals.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">目標がありません</p>
                <p className="text-sm text-gray-400 mt-1">「目標を追加」ボタンから最初の目標を登録しましょう</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                  leftIcon={<Plus size={16} />}
                >
                  最初の目標を追加
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={setEditingGoal}
                    onDelete={setDeletingGoal}
                    onToggleActive={(g) => archiveMutation.mutate({ id: g.id, isActive: false })}
                  />
                ))}
              </div>
            )}
          </section>

          {/* アーカイブ済み目標 */}
          {(inactiveGoals.length > 0 || showInactive) && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  アーカイブ済み ({inactiveGoals.length})
                </h2>
                <button
                  onClick={() => setShowInactive((v) => !v)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  {showInactive ? '非表示' : '表示'}
                </button>
              </div>
              {showInactive && (
                <div className="space-y-2">
                  {inactiveGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={setEditingGoal}
                      onDelete={setDeletingGoal}
                      onToggleActive={(g) => archiveMutation.mutate({ id: g.id, isActive: true })}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* 目標作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="目標を追加"
      >
        <GoalForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      {/* 目標編集モーダル */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="目標を編集"
      >
        <GoalForm
          goal={editingGoal ?? undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditingGoal(null)}
          isSubmitting={updateMutation.isPending}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        title="目標を削除"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              「<strong>{deletingGoal?.title}</strong>」を削除します。
              <br />
              <span className="text-danger-600 dark:text-danger-400">
                関連する達成記録もすべて削除されます。この操作は取り消せません。
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeletingGoal(null)} className="flex-1">
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
              className="flex-1"
            >
              削除する
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
