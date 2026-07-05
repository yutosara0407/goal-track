'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Rss, MessageSquareText } from 'lucide-react';
import { timelineApi } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import { UserAvatar } from '@/components/social/UserCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatRate } from '@/lib/utils';

export default function TimelinePage() {
  const { t } = useLang();

  const { data, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: timelineApi.list,
  });

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.timeline.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.timeline.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4">
            <Rss size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.timeline.empty}</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {data.map((entry, index) => (
            <div
              key={`${entry.user.id}-${entry.date}-${index}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4"
            >
              <div className="flex items-center gap-3">
                <Link href={`/users/${entry.user.id}`} className="shrink-0">
                  <UserAvatar name={entry.user.name} />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/users/${entry.user.id}`}
                      className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                    >
                      {entry.user.name}
                    </Link>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                      {format(parseISO(entry.date), 'M月d日(E)', { locale: ja })}
                    </span>
                  </div>
                  {entry.total_goals > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.calendar.achievedOf(entry.completed_count, entry.total_goals)} ({formatRate(entry.completion_rate)})
                    </p>
                  )}
                </div>
              </div>

              {entry.total_goals > 0 && (
                <ProgressBar value={entry.completion_rate} size="sm" className="mt-3" />
              )}

              {entry.note && (
                <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                  <MessageSquareText size={14} className="shrink-0 mt-0.5 text-slate-400" />
                  <p>{entry.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
