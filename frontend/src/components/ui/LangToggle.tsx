'use client';
import { useLang } from '@/contexts/LangContext';
import { Lang } from '@/i18n/translations';

const LANGS: { value: Lang; label: string }[] = [
  { value: 'ja', label: '日' },
  { value: 'en', label: 'EN' },
  { value: 'ko', label: '한' },
];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={
            lang === value
              ? 'px-2 py-1 bg-indigo-600 text-white font-medium'
              : 'px-2 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
