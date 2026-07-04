/**
 * ユーザーカード
 * 検索結果・フォロワー/フォロー中一覧で使う共通カード
 */
'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { UserSummary } from '@/types';
import { useLang } from '@/contexts/LangContext';
import { FollowButton } from '@/components/social/FollowButton';

/** 名前の頭文字を使ったアバター（画像・絵文字は使わない方針） */
export function UserAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl rounded-3xl' : 'w-11 h-11 text-base rounded-2xl';
  return (
    <div
      className={`${sizeClass} shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/40 select-none`}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function UserCard({ user }: { user: UserSummary }) {
  const { t } = useLang();

  return (
    <div className="flex items-center gap-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
      <Link href={`/users/${user.id}`} className="shrink-0">
        <UserAvatar name={user.name} />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/users/${user.id}`}
          className="block font-semibold text-sm text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {user.name}
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {user.bio || t.social.noBio}
        </p>
        <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-1">
          <Users size={12} />
          {t.social.followersCount(user.followers_count)}
        </p>
      </div>

      <FollowButton userId={user.id} isFollowing={user.is_following} />
    </div>
  );
}
