/**
 * ストリーク（連続達成日数）カードコンポーネント
 * 各目標の連続達成日数をランキング形式で表示する
 */
import { Flame } from 'lucide-react';
import { cn, formatStreak } from '@/lib/utils';
import { StreakInfo } from '@/types';

interface StreakCardProps {
  streaks: StreakInfo[];
}

export function StreakCard({ streaks }: StreakCardProps) {
  // ストリークが0の目標は除外して上位5件を表示
  const activeStreaks = streaks.filter((s) => s.streak > 0).slice(0, 5);

  if (activeStreaks.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          継続ストリーク
        </h3>
        <p className="text-sm text-gray-400 text-center py-2">
          まだストリークがありません 🌱
        </p>
      </div>
    );
  }

  const maxStreak = Math.max(...activeStreaks.map((s) => s.streak));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Flame size={16} className="text-orange-400" />
        継続ストリーク
      </h3>
      <div className="space-y-3">
        {activeStreaks.map((item, index) => (
          <div key={item.goal.id} className="flex items-center gap-3">
            {/* 順位バッジ */}
            <span
              className={cn(
                'w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0',
                index === 0 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                index === 1 && 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                index === 2 && 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
                index > 2 && 'bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500'
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
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
              {item.goal.title}
            </p>

            {/* ストリーク数 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.streak >= 7 && <Flame size={12} className="text-orange-400" />}
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.streak}日
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
