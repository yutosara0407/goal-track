/**
 * フォロー/フォロー解除ボタン
 * 成功時は関連クエリを無効化して一覧・プロフィールの表示を同期する
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  className?: string;
}

export function FollowButton({ userId, isFollowing, className }: FollowButtonProps) {
  const { t } = useLang();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (isFollowing ? usersApi.unfollow(userId) : usersApi.follow(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={cn(
        'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60',
        isFollowing
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200/60 dark:shadow-indigo-900/40 hover:from-indigo-700 hover:to-violet-700',
        className
      )}
    >
      {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
      {isFollowing ? t.social.unfollow : t.social.follow}
    </button>
  );
}
