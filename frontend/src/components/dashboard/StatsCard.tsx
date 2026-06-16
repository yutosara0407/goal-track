import { cn, formatRate } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface StatsCardProps {
  title: string;
  value: number | string;
  rate?: number;
  description?: string;
  icon: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export function StatsCard({ title, value, rate, description, icon, accentColor = '#6366f1', className }: StatsCardProps) {
  return (
    <div className={cn('card p-5 animate-fade-in overflow-hidden relative', className)}>
      {/* カラーアクセントライン（上端） */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">
            {typeof value === 'number' && rate !== undefined ? formatRate(value as number) : value}
          </p>
        </div>
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {icon}
        </div>
      </div>

      {rate !== undefined && <ProgressBar value={rate} size="sm" />}

      {description && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{description}</p>
      )}
    </div>
  );
}
