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

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const today = format(new Date(), 'M月d日(EEEE)', { locale: ja });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: statsApi.overview,
  });

  const firstName = user?.name?.split(' ')[0] ?? user?.name ?? '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          おはようございます、<span className="gradient-text">{firstName}</span>さん 👋
        </h1>
      </div>

      {/* 統計カードグリッド */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isStatsLoading ? (
          <>{[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}</>
        ) : stats ? (
          <>
            <StatsCard
              title="今日"
              value={stats.today_completion_rate}
              rate={stats.today_completion_rate}
              description={`${stats.today_completed_count}/${stats.active_goals}個 完了`}
              icon={<CalendarCheck size={17} style={{ color: '#4f46e5' }} />}
              accentColor="#4f46e5"
            />
            <StatsCard
              title="今週"
              value={stats.week_completion_rate}
              rate={stats.week_completion_rate}
              icon={<TrendingUp size={17} style={{ color: '#7c3aed' }} />}
              accentColor="#7c3aed"
            />
            <StatsCard
              title="今月"
              value={stats.month_completion_rate}
              rate={stats.month_completion_rate}
              icon={<Star size={17} style={{ color: '#d97706' }} />}
              accentColor="#d97706"
            />
            <StatsCard
              title="目標数"
              value={`${stats.active_goals}個`}
              description={`総登録: ${stats.total_goals}個`}
              icon={<Target size={17} style={{ color: '#16a34a' }} />}
              accentColor="#16a34a"
            />
          </>
        ) : null}
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck size={14} className="text-primary-500" />
            今日の目標
          </h2>
          <TodayGoals />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            継続ランキング
          </h2>
          {stats ? (
            <StreakCard streaks={stats.current_streaks} />
          ) : (
            <div className="card p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
