'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Lang, Translations } from '@/i18n/translations';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
  t: translations.ja,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ja');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored && ['ja', 'en', 'ko'].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem('lang', next);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
