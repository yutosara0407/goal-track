'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
  isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn, formatRate, getRateBgClass } from '@/lib/utils';
import { statsApi } from '@/lib/api';
import { CalendarDay, GoalMonthlyStats } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useLang } from '@/contexts/LangContext';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

interface DayDetailProps {
  day: CalendarDay | undefined;
  date: Date;
  goalStats: GoalMonthlyStats[];
  selectPrompt: string;
  achievedOf: (done: number, total: number) => string;
  achieveRate: (rate: string) => string;
}

function DayDetail({ day, date, goalStats, selectPrompt, achievedOf, achieveRate }: DayDetailProps) {
  if (!day) {
    return (
      <div className="text-sm text-gray-400 text-center py-6">
        {selectPrompt}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {format(date, 'M月d日(E)', { locale: ja })}
        </p>
        <p className="text-sm text-gray-500">
          {achievedOf(day.completed_count, day.total_goals)} ({achieveRate(formatRate(day.completion_rate))})
        </p>
      </div>
      <ProgressBar value={day.completion_rate} size="md" showLabel />
    </div>
  );
}

export function CalendarView() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { t } = useLang();

  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'monthly', currentYear, currentMonth],
    queryFn: () => statsApi.monthly(currentYear, currentMonth),
    staleTime: 0,
  });

  const firstDay = startOfMonth(new Date(currentYear, currentMonth - 1));
  const lastDay = endOfMonth(firstDay);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startDayOfWeek = getDay(firstDay);
  const dayDataMap = new Map(data?.days.map((d) => [d.date, d]) ?? []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1) return;
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const isNextDisabled =
    currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  const selectedDayData = selectedDate ? dayDataMap.get(selectedDate) : undefined;
  const selectedDateObj = selectedDate ? parseISO(selectedDate) : null;

  return (
    <div className="space-y-4">
      {/* ナビゲーションヘッダー */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t.calendar.prev}
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {currentYear}年{currentMonth}月
        </h2>

        <button
          onClick={handleNextMonth}
          disabled={isNextDisabled}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={t.calendar.next}
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="card p-4">
        {/* 曜日ラベル */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'text-center text-xs font-medium py-1',
                i === 0 && 'text-danger-400',
                i === 6 && 'text-primary-500',
                i > 0 && i < 6 && 'text-gray-400 dark:text-gray-500'
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 日付セル */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = dayDataMap.get(dateStr);
            const isTodayDate = isToday(date);
            const isSelected = selectedDate === dateStr;
            const isFuture = date > now;
            const hasData = !!dayData;

            return (
              <button
                key={dateStr}
                onClick={() => !isFuture && setSelectedDate(isSelected ? null : dateStr)}
                disabled={isFuture || isLoading}
                className={cn(
                  'relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-150',
                  'text-xs font-medium',
                  isFuture && 'opacity-30 cursor-not-allowed',
                  !isFuture && 'hover:ring-2 hover:ring-primary-400 cursor-pointer',
                  isSelected && 'ring-2 ring-primary-600 dark:ring-primary-400',
                  hasData && !isFuture && dayData!.completion_rate >= 0.5
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300',
                )}
                style={
                  hasData && !isFuture && dayData!.completion_rate > 0
                    ? {
                        backgroundColor: `rgba(99, 102, 241, ${(dayData!.completion_rate * 0.8 + 0.2).toFixed(2)})`,
                      }
                    : undefined
                }
                aria-label={`${format(date, 'M月d日')}: ${dayData ? `${formatRate(dayData.completion_rate)}達成` : t.calendar.noRecord}`}
                aria-pressed={isSelected}
              >
                <span className={cn(
                  isTodayDate && 'underline underline-offset-2 font-bold',
                )}>
                  {date.getDate()}
                </span>
                {hasData && dayData!.completion_rate === 1 && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex items-center gap-3 justify-end">
          <span className="text-xs text-gray-400">{t.calendar.rateLabel}:</span>
          {[0, 0.25, 0.5, 0.75, 1.0].map((rate) => (
            <div
              key={rate}
              className="flex items-center gap-1"
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: rate === 0
                    ? '#f1f5f9'
                    : `rgba(99, 102, 241, ${(rate * 0.8 + 0.2).toFixed(2)})`,
                }}
              />
              <span className="text-xs text-gray-400">{formatRate(rate)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 選択日の詳細 */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t.calendar.dayDetail}
        </h3>
        <DayDetail
          day={selectedDayData}
          date={selectedDateObj || new Date()}
          goalStats={data?.goal_stats ?? []}
          selectPrompt={t.calendar.selectPrompt}
          achievedOf={t.calendar.achievedOf}
          achieveRate={t.calendar.achieveRate}
        />
      </div>

      {/* 目標別月次統計 */}
      {data && data.goal_stats.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t.calendar.goalStats}
          </h3>
          <div className="space-y-3">
            {data.goal_stats.map((stat) => (
              <div key={stat.goal.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stat.goal.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-40">
                      {stat.goal.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{stat.completed_days}/{stat.total_days}日</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
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
    </div>
  );
}
