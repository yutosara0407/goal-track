/**
 * バッジコンポーネント
 * ステータス表示や達成率表示に使用するラベルUI
 */
import { cn } from '@/lib/utils';
import { BadgeVariant } from '@/types';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-400',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
  danger:  'bg-danger-50 text-danger-500 dark:bg-danger-500/20 dark:text-danger-400',
  info:    'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
