'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AtSign, Users, UserRound, SearchX, Info } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useLang } from '@/contexts/LangContext';
import { UserCard } from '@/components/social/UserCard';
import { cn } from '@/lib/utils';

type Tab = 'search' | 'following' | 'followers';

/** 入力が止まってから一定時間後に値を確定させるdebounce */
function useDebouncedValue(value: string, delay = 350): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SocialPage() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  const searchQuery = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => usersApi.search(debouncedQuery),
    enabled: tab === 'search' && debouncedQuery.trim().length > 0,
  });

  const followingQuery = useQuery({
    queryKey: ['users', 'following', user?.id],
    queryFn: () => usersApi.following(user!.id),
    enabled: tab === 'following' && !!user,
  });

  const followersQuery = useQuery({
    queryKey: ['users', 'followers', user?.id],
    queryFn: () => usersApi.followers(user!.id),
    enabled: tab === 'followers' && !!user,
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'search',    label: t.social.tabSearch },
    { id: 'following', label: t.social.tabFollowing },
    { id: 'followers', label: t.social.tabFollowers },
  ];

  const listState = (() => {
    if (tab === 'search') {
      return {
        data: searchQuery.data,
        isLoading: searchQuery.isLoading,
        emptyIcon: query.trim() ? SearchX : AtSign,
        emptyText: query.trim() ? t.social.searchEmpty : t.social.searchHint,
      };
    }
    if (tab === 'following') {
      return {
        data: followingQuery.data,
        isLoading: followingQuery.isLoading,
        emptyIcon: UserRound,
        emptyText: t.social.emptyFollowing,
      };
    }
    return {
      data: followersQuery.data,
      isLoading: followersQuery.isLoading,
      emptyIcon: Users,
      emptyText: t.social.emptyFollowers,
    };
  })();

  const EmptyIcon = listState.emptyIcon;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.social.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.social.subtitle}</p>
      </div>

      {/* ユーザーID未設定の注意（自分が検索されない状態であることを知らせる） */}
      {!user?.username && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 text-sm text-indigo-700 dark:text-indigo-300">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div>
            <p>{t.social.usernameNotSetNotice}</p>
            <Link href="/settings" className="font-medium underline underline-offset-2 hover:no-underline">
              {t.social.goToSettings}
            </Link>
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl w-fit">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === item.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 検索ボックス */}
      {tab === 'search' && (
        <div className="relative max-w-md">
          <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.social.searchPlaceholder}
            maxLength={21}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>
      )}

      {/* 一覧 */}
      {listState.isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : !listState.data || listState.data.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4">
            <EmptyIcon size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{listState.emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {listState.data.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
