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
import { useLang } from '@/contexts/LangContext';

export default function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { t } = useLang();

  const { data: goals, isLoading } = useGoals(showInactive);
  const { createMutation, updateMutation, deleteMutation, archiveMutation } = useGoalMutations();

  const activeGoals = goals?.filter((g) => g.is_active) ?? [];
  const inactiveGoals = goals?.filter((g) => !g.is_active) ?? [];

  const handleCreate = async (data: GoalFormData) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: GoalFormData) => {
    if (!editingGoal) return;
    await updateMutation.mutateAsync({ id: editingGoal.id, data });
    setEditingGoal(null);
  };

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo size={24} className="text-indigo-600" />
            {t.goals.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.goals.subtitle}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          {t.goals.add}
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
              <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t.goals.active} ({activeGoals.length})
              </h2>
            </div>

            {activeGoals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{t.goals.emptyTitle}</p>
                <p className="text-sm text-slate-400 mt-1">{t.goals.emptySubtitle}</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                  leftIcon={<Plus size={16} />}
                >
                  {t.goals.addFirst}
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
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {t.goals.archived} ({inactiveGoals.length})
                </h2>
                <button
                  onClick={() => setShowInactive((v) => !v)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  {showInactive ? t.goals.hide : t.goals.show}
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
        title={t.goals.createTitle}
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
        title={t.goals.editTitle}
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
        title={t.goals.deleteTitle}
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {deletingGoal && t.goals.deleteMessage(deletingGoal.title)}
              <br />
              <span className="text-danger-600 dark:text-danger-400">
                {t.goals.deleteWarning}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeletingGoal(null)} className="flex-1">
              {t.goals.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
              className="flex-1"
            >
              {t.goals.doDelete}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
