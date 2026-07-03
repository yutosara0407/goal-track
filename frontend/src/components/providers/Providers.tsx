'use client';
import { QueryProvider } from './QueryProvider';
import { LangProvider } from '@/contexts/LangContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LangProvider>
        {children}
      </LangProvider>
    </QueryProvider>
  );
}
