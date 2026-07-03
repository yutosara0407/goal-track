'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreakInfo } from '@/types';
import { useLang } from '@/contexts/LangContext';

interface StreakCardProps {
  streaks: StreakInfo[];
}

export function StreakCard({ streaks }: StreakCardProps) {
  const { t } = useLang();
  const activeStreaks = streaks.filter((s) => s.streak > 0).slice(0, 5);

  if (activeStreaks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          {t.streak.title}
        </h3>
        <p className="text-sm text-slate-400 text-center py-2">
          {t.streak.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Flame size={16} className="text-orange-400" />
        {t.streak.title}
      </h3>
      <div className="space-y-3">
        {activeStreaks.map((item, index) => (
          <div key={item.goal.id} className="flex items-center gap-3">
            {/* 順位バッジ */}
            <span
              className={cn(
                'w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0',
                index === 0 && 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white',
                index === 1 && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                index === 2 && 'bg-gradient-to-br from-orange-400 to-amber-400 text-white',
                index > 2 && 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
              )}
            >
              {index + 1}
            </span>

            {/* カラードット */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.goal.color }}
            />

            {/* 目標名 */}
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
              {item.goal.title}
            </p>

            {/* ストリーク数 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.streak >= 7 && <Flame size={12} className="text-orange-400" />}
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.streak}{t.streak.days}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
