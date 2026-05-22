/**
 * 統計カードコンポーネント
 * 達成率・目標数などの数値をビジュアルに表示する
 */
import { cn, formatRate } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface StatsCardProps {
  title: string;
  value: number | string;
  /** 0.0〜1.0の達成率（ProgressBar表示に使用） */
  rate?: number;
  description?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  rate,
  description,
  icon,
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/30',
  className,
}: StatsCardProps) {
  return (
    <div className={cn('card p-5 animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' && rate !== undefined ? formatRate(value as number) : value}
          </p>
        </div>
        <div className={cn('p-2.5 rounded-xl', iconBgColor)}>
          {icon}
        </div>
      </div>

      {/* 達成率バー */}
      {rate !== undefined && (
        <ProgressBar value={rate} size="sm" />
      )}

      {/* 補足説明 */}
      {description && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{description}</p>
      )}
    </div>
  );
}
