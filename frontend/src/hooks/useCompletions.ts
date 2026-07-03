/**
 * 達成記録管理カスタムフック
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completionsApi } from '@/lib/api';
import { ToggleCompletionData } from '@/types';
import { todayString } from '@/lib/utils';

/** QueryKeyの定数 */
export const COMPLETIONS_QUERY_KEY = ['completions'] as const;

/**
 * 指定日の達成状況を取得するフック
 * @param date YYYY-MM-DD形式（省略時は今日）
 */
export function useDayCompletions(date?: string) {
  const targetDate = date || todayString();
  return useQuery({
    queryKey: [...COMPLETIONS_QUERY_KEY, 'day', targetDate],
    queryFn: () => completionsApi.getByDate(targetDate),
    // 1分ごとに再フェッチ（別タブで更新された場合も反映）
    staleTime: 60 * 1000,
  });
}

/**
 * 達成状態のトグル（チェックON/OFF）フック
 * 楽観的更新（Optimistic Update）でUIを即時反映させる
 */
export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleCompletionData) => completionsApi.toggle(data),
    onMutate: async (variables) => {
      const queryKey = [...COMPLETIONS_QUERY_KEY, 'day', variables.date];

      // 進行中のリフェッチをキャンセルして競合を防ぐ
      await queryClient.cancelQueries({ queryKey });

      // 現在のキャッシュを保存（ロールバック用）
      const previousData = queryClient.getQueryData(queryKey);

      // 楽観的更新: APIレスポンスを待たずにUIを即時更新
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as { items: Array<{ goal: { id: number }; completed: boolean }> };
        return {
          ...data,
          items: data.items.map((item) =>
            item.goal.id === variables.goal_id
              ? { ...item, completed: variables.completed }
              : item
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, variables, context) => {
      // エラー時はキャッシュを元に戻す
      const queryKey = [...COMPLETIONS_QUERY_KEY, 'day', variables.date];
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: (_data, _err, variables) => {
      // 成功・失敗いずれの場合もサーバーと同期
      queryClient.invalidateQueries({
        queryKey: [...COMPLETIONS_QUERY_KEY, 'day', variables.date],
      });
      // 統計データを更新（overview・monthly 両方を明示的に無効化）
      queryClient.invalidateQueries({ queryKey: ['stats', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'monthly'] });
    },
  });
}

/**
 * 達成記録を削除するフック（未記録状態に戻す）
 */
export function useRemoveCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; goal_id: number; date: string }) =>
      completionsApi.remove(id),
    onMutate: async ({ goal_id, date }) => {
      const queryKey = [...COMPLETIONS_QUERY_KEY, 'day', date];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as { items: Array<{ goal: { id: number }; completed: boolean; completion_id: number | null }> };
        return {
          ...data,
          items: data.items.map((item) =>
            item.goal.id === goal_id
              ? { ...item, completed: false, completion_id: null }
              : item
          ),
        };
      });
      return { previousData };
    },
    onError: (_err, { date }, context) => {
      const queryKey = [...COMPLETIONS_QUERY_KEY, 'day', date];
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: [...COMPLETIONS_QUERY_KEY, 'day', date] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'monthly'] });
    },
  });
}

/**
 * 達成履歴を取得するフック
 */
export function useCompletionHistory(from?: string, to?: string, goalId?: number) {
  return useQuery({
    queryKey: [...COMPLETIONS_QUERY_KEY, 'history', { from, to, goalId }],
    queryFn: () => completionsApi.getHistory(from, to, goalId),
    enabled: !!from || !!to, // パラメータがある場合のみ実行
  });
}
