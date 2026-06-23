import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Target, CheckCircle2, TrendingUp, CalendarDays, Mail, Zap, ChevronRight } from 'lucide-react';

export default async function RootPage() {
  const cookieStore = await cookies();
  if (cookieStore.has('goal_app_auth')) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">GoalTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 text-xs font-medium mb-6">
          <Zap size={12} />
          習慣化をシンプルに
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
          目標を、毎日の習慣に。
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mb-8">
          GoalTrack は目標の記録・達成率の可視化・メールリマインダーで、あなたの習慣づくりをサポートします。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            無料で始める <ChevronRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-10">
            シンプルな 3 つの機能
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle2 size={20} className="text-emerald-500" />,
                title: '毎日のチェック',
                desc: '目標を登録して、毎日達成したかチェックするだけ。シンプルな操作で継続しやすい。',
              },
              {
                icon: <TrendingUp size={20} className="text-primary-500" />,
                title: '達成率の可視化',
                desc: 'ダッシュボードやカレンダーで達成率・ストリークをひと目で確認。モチベーションが続く。',
              },
              {
                icon: <CalendarDays size={20} className="text-violet-500" />,
                title: '履歴・分析',
                desc: '月別・目標別の達成履歴を振り返り、自分の習慣パターンを把握できる。',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* プラン比較 */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            プランを選ぶ
          </h2>
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-10">
            まずは無料プランで試せます。いつでもアップグレード可能。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Free</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">¥0</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  '目標登録 無制限',
                  'ダッシュボード・カレンダー',
                  '履歴・分析',
                  <span key="email-free" className="flex items-center gap-1.5">
                    <Mail size={12} className="text-gray-400 shrink-0" />
                    メールリマインダー <span className="font-semibold text-gray-900 dark:text-white">月30通</span>まで
                  </span>,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2 px-4 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                無料で始める
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-500/10 p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary-600 text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
                おすすめ
              </span>
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Premium</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ¥500<span className="text-sm font-normal text-gray-500">/月</span>
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Free プランの全機能',
                  <span key="email-premium" className="flex items-center gap-1.5">
                    <Mail size={12} className="text-primary-500 shrink-0" />
                    メールリマインダー <span className="font-semibold text-gray-900 dark:text-white">月100通</span>まで
                  </span>,
                  '優先サポート',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <CheckCircle2 size={15} className="text-primary-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2 px-4 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                プレミアムで始める
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
            ※ メール送信数は毎月1日にリセットされます
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-6 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 GoalTrack</p>
      </footer>
    </div>
  );
}
