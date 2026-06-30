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
  const defaultGradient =
    percentage >= 80
      ? 'linear-gradient(to right, #22c55e, #16a34a)'
      : percentage >= 50
      ? 'linear-gradient(to right, #f59e0b, #d97706)'
      : 'linear-gradient(to right, #ef4444, #dc2626)';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* バー本体 */}
      <div className={cn('flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: color ? undefined : defaultGradient,
            backgroundColor: color || undefined,
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* パーセント表示 */}
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}
