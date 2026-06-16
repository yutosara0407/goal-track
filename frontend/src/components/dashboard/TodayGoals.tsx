'use client';

import { useState } from 'react';
import { cn, todayString } from '@/lib/utils';
import { useDayCompletions, useToggleCompletion } from '@/hooks/useCompletions';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { GoalCheckItem } from '@/components/dashboard/GoalCheckItem';
import { NoteModal } from '@/components/dashboard/NoteModal';
import { DayCompletionItem } from '@/types';

export function TodayGoals() {
  const today = todayString();
  const { data, isLoading, error } = useDayCompletions(today);
  const toggleMutation = useToggleCompletion();
  const [noteTarget, setNoteTarget] = useState<DayCompletionItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center text-gray-400">
        <p className="text-sm">データの取得に失敗しました</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="w-14 h-14 rounded-2xl gradient-bg mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary-200/40 dark:shadow-primary-900/30">
          <span className="text-2xl">🎯</span>
        </div>
        <p className="font-semibold text-gray-700 dark:text-gray-300">目標がまだありません</p>
        <p className="text-sm text-gray-400 mt-1.5">
          <a href="/goals" className="text-primary-600 hover:underline">目標管理</a>から最初の目標を追加しましょう
        </p>
      </div>
    );
  }

  const completedCount = data.items.filter((i) => i.completed).length;
  const totalCount = data.items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleToggle = (item: DayCompletionItem) => {
    toggleMutation.mutate({ goal_id: item.goal.id, date: today, completed: !item.completed });
  };

  const handleSaveNote = (note: string) => {
    if (!noteTarget) return;
    toggleMutation.mutate({ goal_id: noteTarget.goal.id, date: today, completed: noteTarget.completed, note });
    setNoteTarget(null);
  };

  return (
    <>
      {/* 進捗サマリー */}
      <div className="card p-4 mb-3 flex items-center gap-4">
        {/* 円グラフ風パーセント */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.2" className="text-gray-100 dark:text-gray-800" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="url(#progressGrad)" strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white tabular-nums">
            {percentage}%
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {completedCount === totalCount ? '🎉 全部完了！' : '今日の進捗'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {completedCount}/{totalCount} 個完了
          </p>
        </div>
      </div>

      {/* 目標チェックリスト */}
      <div className="space-y-2">
        {data.items.map((item) => (
          <GoalCheckItem
            key={item.goal.id}
            item={item}
            onToggle={handleToggle}
            onNoteClick={setNoteTarget}
            isPending={toggleMutation.isPending}
          />
        ))}
      </div>

      {noteTarget && (
        <NoteModal
          item={noteTarget}
          onClose={() => setNoteTarget(null)}
          onSave={handleSaveNote}
        />
      )}
    </>
  );
}
