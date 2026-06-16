'use client';

import { CheckCircle2, Circle, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayCompletionItem } from '@/types';

interface GoalCheckItemProps {
  item: DayCompletionItem;
  onToggle: (item: DayCompletionItem) => void;
  onNoteClick: (item: DayCompletionItem) => void;
  isPending?: boolean;
}

export function GoalCheckItem({ item, onToggle, onNoteClick, isPending }: GoalCheckItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200',
        item.completed
          ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/60'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
      )}
    >
      {/* チェックボタン */}
      <button
        onClick={() => onToggle(item)}
        disabled={isPending}
        className="flex-shrink-0 transition-transform duration-200 hover:scale-110 active:scale-90 focus:outline-none"
        aria-label={`${item.goal.title}を${item.completed ? '未達成に' : '達成済みに'}する`}
      >
        {item.completed ? (
          <CheckCircle2 size={24} style={{ color: item.goal.color }} className="drop-shadow-sm" />
        ) : (
          <Circle size={24} className="text-gray-300 dark:text-gray-600" />
        )}
      </button>

      {/* カラーライン */}
      <div
        className="w-0.5 h-8 rounded-full flex-shrink-0 opacity-60"
        style={{ backgroundColor: item.goal.color }}
      />

      {/* 目標情報 */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate transition-colors duration-200',
            item.completed
              ? 'line-through text-gray-400 dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-200'
          )}
        >
          {item.goal.title}
        </p>
        {item.note && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {item.note}
          </p>
        )}
      </div>

      {/* メモボタン */}
      <button
        onClick={() => onNoteClick(item)}
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg transition-all duration-150',
          'text-gray-300 dark:text-gray-600',
          'opacity-0 group-hover:opacity-100',
          'hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          item.note && 'opacity-100 text-gray-400 dark:text-gray-500'
        )}
        aria-label="メモを編集"
      >
        <PenLine size={13} />
      </button>
    </div>
  );
}
