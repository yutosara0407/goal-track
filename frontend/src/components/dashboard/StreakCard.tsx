import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreakInfo } from '@/types';

const RANK_STYLES = [
  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: '🥇' },
  { bg: 'bg-gray-100 dark:bg-gray-800',     text: 'text-gray-500 dark:text-gray-400',   label: '🥈' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', label: '🥉' },
];

interface StreakCardProps {
  streaks: StreakInfo[];
}

export function StreakCard({ streaks }: StreakCardProps) {
  const activeStreaks = streaks.filter((s) => s.streak > 0).slice(0, 5);
  const maxStreak = activeStreaks.length > 0 ? Math.max(...activeStreaks.map((s) => s.streak)) : 1;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <Flame size={15} className="text-orange-400" />
        継続ストリーク
      </h3>

      {activeStreaks.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-2xl mb-1">🌱</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">目標を達成してストリークを作ろう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeStreaks.map((item, index) => {
            const rank = RANK_STYLES[index] ?? RANK_STYLES[2];
            const barWidth = Math.round((item.streak / maxStreak) * 100);

            return (
              <div key={item.goal.id} className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={cn('w-5 h-5 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0', rank.bg, rank.text)}>
                    {index < 3 ? rank.label : index + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.goal.color }} />
                  <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{item.goal.title}</p>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {item.streak >= 7 && <Flame size={11} className="text-orange-400" />}
                    <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{item.streak}日</span>
                  </div>
                </div>
                {/* ストリークバー */}
                <div className="ml-7 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, backgroundColor: item.goal.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
