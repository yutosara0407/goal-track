/**
 * ダッシュボードページ
 * 今日の達成状況・全体統計・ストリーク情報を一覧表示する
 */
'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Target, CalendarCheck, Star } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodayGoals } from '@/components/dashboard/TodayGoals';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { statsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { Metadata } from 'next';
import { formatRate } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const today = format(new Date(), 'M月d日(EEEE)', { locale: ja });

  // サマリー統計を取得
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
          おはようございます、{user?.name?.split(' ')[0]}さん 👋
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
              title="今日の達成率"
              value={stats.today_completion_rate}
              rate={stats.today_completion_rate}
              description={`${stats.today_completed_count}/${stats.active_goals}個 完了`}
              icon={<CalendarCheck size={18} className="text-indigo-600 dark:text-indigo-400" />}
              iconBgColor="bg-primary-50 dark:bg-primary-900/20"
            />
            <StatsCard
              title="今週の達成率"
              value={stats.week_completion_rate}
              rate={stats.week_completion_rate}
              icon={<TrendingUp size={18} className="text-violet-600 dark:text-violet-400" />}
              iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            />
            <StatsCard
              title="今月の達成率"
              value={stats.month_completion_rate}
              rate={stats.month_completion_rate}
              icon={<Star size={18} className="text-amber-500 dark:text-amber-400" />}
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatsCard
              title="登録目標数"
              value={`${stats.active_goals}個`}
              description={`総目標数: ${stats.total_goals}個`}
              icon={<Target size={18} className="text-emerald-600 dark:text-emerald-400" />}
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
          </>
        ) : null}
      </div>

      {/* メインコンテンツ: 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* 今日の目標チェックリスト（2/3幅） */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CalendarCheck size={18} className="text-indigo-600" />
            今日の目標
          </h2>
          <TodayGoals />
        </div>

        {/* ストリーク（1/3幅） */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
            🔥 継続ランキング
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
