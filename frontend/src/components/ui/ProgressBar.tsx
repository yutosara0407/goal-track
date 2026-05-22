/**
 * プログレスバーコンポーネント
 * 達成率をビジュアルで表現する
 */
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** 0.0〜1.0の達成率 */
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** カスタムカラー（HEXコード） */
  color?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  className,
  showLabel = false,
  size = 'md',
  color,
}: ProgressBarProps) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  // 達成率に応じたデフォルトカラー
  const defaultColor =
    percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* バー本体 */}
      <div className={cn('flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color || defaultColor,
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* パーセント表示 */}
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}
