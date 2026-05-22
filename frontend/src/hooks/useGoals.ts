/**
 * 目標管理カスタムフック
 * TanStack Queryを使ったデータフェッチとキャッシュ管理
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { goalsApi } from '@/lib/api';
import { GoalFormData } from '@/types';
import { extractErrorMessage } from '@/lib/utils';

/** QueryKeyの定数定義（文字列の打ち間違いを防ぐ） */
export const GOALS_QUERY_KEY = ['goals'] as const;

/**
 * 目標一覧を取得するフック
 */
export function useGoals(includeInactive = false) {
  return useQuery({
    queryKey: [...GOALS_QUERY_KEY, { includeInactive }],
    queryFn: () => goalsApi.list(includeInactive),
  });
}

/**
 * 目標のCRUD操作フック
 */
export function useGoalMutations() {
  const queryClient = useQueryClient();

  /**
   * キャッシュを無効化して最新データを再取得させる
   * （目標に関わる全クエリを再フェッチ）
   */
  const invalidateGoals = () => {
    queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    // 達成状況や統計もゴールに依存するため一緒に更新
    queryClient.invalidateQueries({ queryKey: ['completions'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };

  /** 目標作成 */
  const createMutation = useMutation({
    mutationFn: (data: GoalFormData) => goalsApi.create(data),
    onSuccess: (newGoal) => {
      invalidateGoals();
      toast.success(`「${newGoal.title}」を追加しました！`);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  /** 目標更新 */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GoalFormData> & { is_active?: boolean } }) =>
      goalsApi.update(id, data),
    onSuccess: (updatedGoal) => {
      invalidateGoals();
      toast.success(`「${updatedGoal.title}」を更新しました`);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  /** 目標削除 */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      invalidateGoals();
      toast.success('目標を削除しました');
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  /** 目標のアーカイブ（論理的な非表示） */
  const archiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      goalsApi.update(id, { is_active: isActive }),
    onSuccess: (goal) => {
      invalidateGoals();
      toast.success(goal.is_active ? '目標を再開しました' : '目標をアーカイブしました');
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    archiveMutation,
  };
}
