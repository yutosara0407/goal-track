'use client';

import { CalendarDays } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useLang } from '@/contexts/LangContext';

export default function CalendarPage() {
  const { t } = useLang();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays size={24} className="text-primary-600" />
          {t.calendar.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.calendar.subtitle}
        </p>
      </div>

      {/* カレンダーコンポーネント */}
      <CalendarView />
    </div>
  );
}
