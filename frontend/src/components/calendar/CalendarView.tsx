/**
 * カレンダービューコンポーネント
 * 月次カレンダーで各日の目標達成状況をヒートマップ形式で表示する
 */
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

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

interface DayDetailProps {
  day: CalendarDay | undefined;
  date: Date;
  goalStats: GoalMonthlyStats[];
}

/** 選択した日の詳細表示 */
function DayDetail({ day, date, goalStats }: DayDetailProps) {
  if (!day) {
    return (
      <div className="text-sm text-gray-400 text-center py-6">
        日付を選択すると詳細が表示されます
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
          {day.completed_count}/{day.total_goals}個 達成 ({formatRate(day.completion_rate)})
        </p>
      </div>
      <ProgressBar value={day.completion_rate} size="md" showLabel />
    </div>
  );
}

export function CalendarView() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 月次統計データを取得
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'monthly', currentYear, currentMonth],
    queryFn: () => statsApi.monthly(currentYear, currentMonth),
  });

  // カレンダーの日付グリッドを生成
  const firstDay = startOfMonth(new Date(currentYear, currentMonth - 1));
  const lastDay = endOfMonth(firstDay);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // 月の始まりの曜日（0=日曜）
  const startDayOfWeek = getDay(firstDay);

  // 日付ごとのデータをマップ化（O(1)アクセス）
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
    // 未来の月には進めない
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
          aria-label="前の月"
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
          aria-label="次の月"
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
          {/* 月の始まりまでの空白セル */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* 各日のセル */}
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
                  // ヒートマップカラー（達成率に応じた背景色）
                  hasData && !isFuture && dayData!.completion_rate > 0
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400',
                )}
                style={
                  hasData && !isFuture
                    ? {
                        backgroundColor: dayData!.completion_rate > 0
                          ? `color-mix(in srgb, #6366f1 ${Math.round(dayData!.completion_rate * 80 + 20)}%, transparent)`
                          : undefined,
                      }
                    : undefined
                }
                aria-label={`${format(date, 'M月d日')}: ${dayData ? `${formatRate(dayData.completion_rate)}達成` : '記録なし'}`}
                aria-pressed={isSelected}
              >
                <span className={cn(
                  isTodayDate && 'underline underline-offset-2 font-bold',
                  hasData && dayData!.completion_rate > 0 ? 'text-white' : ''
                )}>
                  {date.getDate()}
                </span>
                {/* 達成率インジケータードット */}
                {hasData && dayData!.completion_rate === 1 && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex items-center gap-3 justify-end">
          <span className="text-xs text-gray-400">達成率:</span>
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
                    : `color-mix(in srgb, #6366f1 ${Math.round(rate * 80 + 20)}%, transparent)`,
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
          日別詳細
        </h3>
        <DayDetail
          day={selectedDayData}
          date={selectedDateObj || new Date()}
          goalStats={data?.goal_stats ?? []}
        />
      </div>

      {/* 目標別月次統計 */}
      {data && data.goal_stats.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            目標別達成状況
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
