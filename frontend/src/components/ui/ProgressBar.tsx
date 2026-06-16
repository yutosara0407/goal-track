import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ value, className, showLabel = false, size = 'md', color }: ProgressBarProps) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  // 達成率に応じたグラデーション
  const getGradient = () => {
    if (color) return undefined;
    if (percentage >= 80) return 'linear-gradient(90deg, #22c55e, #16a34a)';
    if (percentage >= 50) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    return 'linear-gradient(90deg, #f87171, #ef4444)';
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: color ? color : getGradient(),
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}
