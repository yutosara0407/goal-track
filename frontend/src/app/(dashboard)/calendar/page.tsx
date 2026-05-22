/**
 * カレンダービューページ
 * 月次カレンダーで各目標の達成状況をヒートマップ表示する
 */
import { CalendarDays } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays size={24} className="text-primary-600" />
          カレンダー
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          月次カレンダーで達成状況を振り返れます
        </p>
      </div>

      {/* カレンダーコンポーネント */}
      <CalendarView />
    </div>
  );
}
