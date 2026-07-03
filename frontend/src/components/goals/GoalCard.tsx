'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/contexts/LangContext';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onToggleActive: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onToggleActive }: GoalCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLang();

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-black/20 flex items-center gap-4 transition-all duration-200',
        !goal.is_active && 'opacity-60'
      )}
    >
      {/* カラーバー（左端のアクセントライン） */}
      <div
        className="w-1.5 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: goal.color }}
      />

      {/* メイン情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {goal.title}
          </h3>
          {!goal.is_active && (
            <Badge variant="neutral">{t.goals.archivedLabel}</Badge>
          )}
        </div>
        {goal.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {goal.description}
          </p>
        )}
      </div>

      {/* カラードット */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: goal.color }}
      />

      {/* アクションメニュー */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="操作メニュー"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <MoreVertical size={16} />
        </button>

        {/* ドロップダウンメニュー */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-40 bg-white dark:bg-slate-900 rounded-2xl py-1 shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 animate-slide-up">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(goal);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit2 size={14} />
                {t.goals.edit}
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleActive(goal);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {goal.is_active ? <Archive size={14} /> : <RotateCcw size={14} />}
                {goal.is_active ? t.goals.archive : t.goals.restore}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(goal);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
              >
                <Trash2 size={14} />
                {t.goals.delete}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
