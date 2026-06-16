'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onToggleActive: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onToggleActive }: GoalCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'card overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        !goal.is_active && 'opacity-55'
      )}
    >
      {/* カラーアクセントバー（上端） */}
      <div className="h-1" style={{ backgroundColor: goal.color }} />

      <div className="flex items-center gap-3 p-4">
        {/* カラードット */}
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: `${goal.color}18` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
        </div>

        {/* メイン情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {goal.title}
            </h3>
            {!goal.is_active && <Badge variant="neutral">アーカイブ</Badge>}
          </div>
          {goal.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{goal.description}</p>
          )}
        </div>

        {/* アクションメニュー */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="操作メニュー"
          >
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-1 w-40 card py-1.5 shadow-lg border border-gray-100 dark:border-gray-700 animate-slide-up">
                <button
                  onClick={() => { setIsMenuOpen(false); onEdit(goal); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit2 size={13} className="text-gray-400" /> 編集
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); onToggleActive(goal); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {goal.is_active
                    ? <><Archive size={13} className="text-gray-400" /> アーカイブ</>
                    : <><RotateCcw size={13} className="text-gray-400" /> 再開</>
                  }
                </button>
                <div className="my-1 mx-2 border-t border-gray-100 dark:border-gray-700" />
                <button
                  onClick={() => { setIsMenuOpen(false); onDelete(goal); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                >
                  <Trash2 size={13} /> 削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
