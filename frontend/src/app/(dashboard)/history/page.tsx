'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { History, CheckCircle2, TrendingUp, Download } from 'lucide-react';
import { statsApi, completionsApi } from '@/lib/api';
import { useGoals } from '@/hooks/useGoals';
import { downloadCsv, formatRate, todayString } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useLang } from '@/contexts/LangContext';

type PeriodOption = '7days' | '30days' | 'thisMonth' | 'lastMonth';

function getPeriodRange(period: PeriodOption): { from: string; to: string } {
  const today = new Date();
  switch (period) {
    case '7days':
      return { from: format(subDays(today, 6), 'yyyy-MM-dd'), to: todayString() };
    case '30days':
      return { from: format(subDays(today, 29), 'yyyy-MM-dd'), to: todayString() };
    case 'thisMonth':
      return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to: todayString(),
      };
    case 'lastMonth': {
      const lastMonth = subMonths(today, 1);
      return {
        from: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        to: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    }
  }
}

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('30days');
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined);
  const { t } = useLang();

  const periodOptions: { value: PeriodOption; label: string }[] = [
    { value: '7days',     label: t.history.last7 },
    { value: '30days',    label: t.history.last30 },
    { value: 'thisMonth', label: t.history.thisMonth },
    { value: 'lastMonth', label: t.history.lastMonth },
  ];

  const { from, to } = getPeriodRange(selectedPeriod);
  const { data: goals } = useGoals();

  const now = new Date();
  const { data: monthlyStats, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['stats', 'monthly', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => statsApi.monthly(now.getFullYear(), now.getMonth() + 1),
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['completions', 'history', { from, to, goalId: selectedGoalId }],
    queryFn: () => completionsApi.getHistory(from, to, selectedGoalId),
  });

  const chartData = monthlyStats?.days.map((d) => ({
    date: format(new Date(d.date), 'M/d'),
    rate: Math.round(d.completion_rate * 100),
    completed: d.completed_count,
    total: d.total_goals,
  })) ?? [];

  const handleExportCsv = () => {
    if (!historyData || historyData.length === 0) return;
    const rows = [
      [t.history.csvHeaderGoal, t.history.csvHeaderDate, t.history.csvHeaderNote],
      ...historyData.map((c) => [c.goal?.title ?? '', c.date, c.note ?? '']),
    ];
    downloadCsv(`goal-track-history_${from}_${to}.csv`, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History size={24} className="text-indigo-600" />
          {t.history.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.history.subtitle}
        </p>
      </div>

      {/* 今月のグラフ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-600" />
          {t.history.monthlyChart}
        </h2>
        {isMonthlyLoading ? (
          <div className="h-40 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, t.history.goalStats]}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rate >= 80 ? '#22c55e' : entry.rate >= 50 ? '#f59e0b' : '#ef4444'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-8">{t.history.noData}</p>
        )}
      </div>

      {/* 目標別達成統計 */}
      {monthlyStats && monthlyStats.goal_stats.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            {t.history.goalStats}
          </h2>
          <div className="space-y-4">
            {monthlyStats.goal_stats
              .sort((a, b) => b.completion_rate - a.completion_rate)
              .map((stat) => (
                <div key={stat.goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stat.goal.color }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{stat.goal.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stat.current_streak >= 3 && (
                        <Badge variant="warning">{t.history.streakBadge(stat.current_streak)}</Badge>
                      )}
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatRate(stat.completion_rate)}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={stat.completion_rate}
                    size="sm"
                    color={stat.goal.color}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 達成履歴リスト */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success-600" />
            {t.history.historyList}
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* CSVエクスポート */}
            <button
              onClick={handleExportCsv}
              disabled={!historyData || historyData.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              {t.history.exportCsv}
            </button>

            {/* 期間フィルター */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-3 py-1.5 transition-colors ${
                    selectedPeriod === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 目標フィルター */}
            <select
              value={selectedGoalId ?? ''}
              onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : undefined)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t.history.allGoals}</option>
              {goals?.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 履歴リスト */}
        {isHistoryLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 p-2 animate-pulse">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !historyData || historyData.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">
            {t.history.noHistory}
          </p>
        ) : (
          <div className="space-y-1">
            {historyData.map((completion) => (
              <div
                key={completion.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${completion.goal?.color ?? '#6366f1'}20`,
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: completion.goal?.color ?? '#6366f1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                    {completion.goal?.title ?? '不明な目標'}
                  </p>
                  {completion.note && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{completion.note}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {format(new Date(completion.date), 'M/d(E)', { locale: ja })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 集計情報 */}
        {historyData && historyData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              {t.history.summary(
                format(new Date(from), 'M月d日', { locale: ja }),
                format(new Date(to), 'M月d日', { locale: ja }),
                historyData.length
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
