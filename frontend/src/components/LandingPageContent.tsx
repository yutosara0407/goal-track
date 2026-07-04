'use client';

import Link from 'next/link';
import { Target, CheckCircle2, TrendingUp, CalendarDays, Zap, ChevronRight } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LangToggle } from '@/components/ui/LangToggle';

export function LandingPageContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-900 dark:via-indigo-900/20 dark:to-slate-950 flex flex-col">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GoalTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.landing.login}
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all"
            >
              {t.landing.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 text-xs font-medium mb-6">
          <Zap size={12} />
          {t.landing.badge}
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-violet-700 dark:from-white dark:via-indigo-200 dark:to-violet-200 bg-clip-text text-transparent leading-tight mb-4">
          {t.landing.hero}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mb-8">
          {t.landing.heroSub}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all"
          >
            {t.landing.getStarted} <ChevronRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
          >
            {t.landing.login}
          </Link>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200/60 dark:border-slate-700/60 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-10">
            {t.landing.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle2 size={20} className="text-emerald-500" />, ...t.landing.features[0] },
              { icon: <TrendingUp size={20} className="text-indigo-500" />, ...t.landing.features[1] },
              { icon: <CalendarDays size={20} className="text-violet-500" />, ...t.landing.features[2] },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t.landing.ctaTitle}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            {t.landing.ctaSub}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all"
          >
            {t.landing.startFree} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-6 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
        <div className="flex items-center justify-center gap-4 mb-2 text-xs">
          <Link href="/terms" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            {t.legal.terms}
          </Link>
          <Link href="/privacy" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            {t.legal.privacy}
          </Link>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{t.landing.copyright}</p>
      </footer>
    </div>
  );
}
