'use client';

import { useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Target, CalendarCheck, Star, Flame, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodayGoals } from '@/components/dashboard/TodayGoals';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { statsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatRate, todayString } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

/** YYYY-MM-DDかつ今日以前の日付だけを受け付ける（不正値は今日にフォールバック） */
function sanitizeDate(value: string | undefined): string {
  const today = todayString();
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return today;
  return value <= today ? value : today;
}

export default function DashboardPage({ searchParams }: { searchParams?: { date?: string } }) {
  const user = useAuthStore((state) => state.user);
  const today = format(new Date(), 'M月d日(EEEE)', { locale: ja });
  const { t } = useLang();

  // 表示・記録対象の日付。カレンダーからは ?date=YYYY-MM-DD で遷移してくる
  const [selectedDate, setSelectedDate] = useState<string>(() => sanitizeDate(searchParams?.date));
  const isToday = selectedDate === todayString();
  const selectedLabel = format(parseISO(selectedDate), 'M月d日(E)', { locale: ja });

  const moveDay = (delta: number) => {
    const next = format(addDays(parseISO(selectedDate), delta), 'yyyy-MM-dd');
    setSelectedDate(sanitizeDate(next));
  };

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: statsApi.overview,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
        <h1 className="text-2xl font-bold mt-0.5 bg-gradient-to-r from-slate-800 to-indigo-700 dark:from-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
          {t.dashboard.greeting(user?.name?.split(' ')[0] ?? '')}
        </h1>
      </div>

      {/* 統計カードグリッド */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {isStatsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatsCard
              title={t.dashboard.todayRate}
              value={stats.today_completion_rate}
              rate={stats.today_completion_rate}
              description={t.dashboard.completedDesc(stats.today_completed_count, stats.active_goals)}
              icon={<CalendarCheck size={18} className="text-indigo-600 dark:text-indigo-400" />}
              iconBgColor="bg-primary-50 dark:bg-primary-900/20"
            />
            <StatsCard
              title={t.dashboard.weekRate}
              value={stats.week_completion_rate}
              rate={stats.week_completion_rate}
              icon={<TrendingUp size={18} className="text-violet-600 dark:text-violet-400" />}
              iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            />
            <StatsCard
              title={t.dashboard.monthRate}
              value={stats.month_completion_rate}
              rate={stats.month_completion_rate}
              icon={<Star size={18} className="text-amber-500 dark:text-amber-400" />}
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatsCard
              title={t.dashboard.goalCount}
              value={`${stats.active_goals}個`}
              description={t.dashboard.totalGoals(stats.total_goals)}
              icon={<Target size={18} className="text-emerald-600 dark:text-emerald-400" />}
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
          </>
        ) : null}
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* 目標チェックリスト（2/3幅）: 日付ナビで過去日の記録もつけられる */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
              <CalendarCheck size={18} className="text-indigo-600 shrink-0" />
              <span className="truncate">
                {isToday ? t.dashboard.todayGoals : t.dashboard.pastGoals(selectedLabel)}
              </span>
            </h2>

            {/* 日付ナビゲーション */}
            <div className="flex items-center gap-1 shrink-0">
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(todayString())}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 mr-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  {t.dashboard.backToToday}
                </button>
              )}
              <button
                onClick={() => moveDay(-1)}
                aria-label={t.dashboard.prevDay}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 min-w-[5.5rem] text-center tabular-nums">
                {isToday ? t.dashboard.navToday : selectedLabel}
              </span>
              <button
                onClick={() => moveDay(1)}
                disabled={isToday}
                aria-label={t.dashboard.nextDay}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 過去日編集中の注意表示 */}
          {!isToday && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 text-xs font-medium text-amber-700 dark:text-amber-400">
              <History size={14} className="shrink-0" />
              {t.dashboard.editingPast}
            </div>
          )}

          <TodayGoals date={selectedDate} />
        </div>

        {/* ストリーク（1/3幅） */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Flame size={18} className="text-orange-500" />
            {t.dashboard.streakRanking}
          </h2>
          {stats ? (
            <StreakCard streaks={stats.current_streaks} />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
