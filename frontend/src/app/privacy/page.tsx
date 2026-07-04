import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | GoalTrack',
};

/** 見出し+本文のセクション */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-900 dark:via-indigo-900/20 dark:to-violet-900/10">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          トップページに戻る
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">プライバシーポリシー</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-10">最終更新日: 2026年7月4日</p>

        <Section title="1. 収集する情報">
          <p>本サービス（GoalTrack）は、サービスの提供にあたり以下の情報を収集します。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>アカウント情報: 名前、メールアドレス、パスワード（ハッシュ化して保存し、平文では保持しません）</li>
            <li>ユーザーが登録したコンテンツ: 目標、達成記録、メモ</li>
            <li>技術情報: アクセスログ（IPアドレス、リクエスト日時など）</li>
          </ul>
        </Section>

        <Section title="2. 利用目的">
          <p>収集した情報は、以下の目的でのみ利用します。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービスの提供・運営・改善</li>
            <li>本人確認、認証、パスワード再設定などのアカウント管理</li>
            <li>不正利用の防止とセキュリティの確保</li>
          </ul>
        </Section>

        <Section title="3. 第三者への提供">
          <p>
            法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。広告目的での個人情報の提供・販売は一切行いません。
          </p>
        </Section>

        <Section title="4. Cookie・ローカルストレージ">
          <p>
            本サービスは、ログイン状態の維持および表示設定（テーマ・言語）の保存のために、Cookieおよびブラウザのローカルストレージを使用します。広告・トラッキング目的のCookieは使用しません。
          </p>
        </Section>

        <Section title="5. 安全管理措置">
          <p>
            パスワードは業界標準のハッシュアルゴリズム（Argon2id）で保護し、通信はHTTPSで暗号化しています。
          </p>
        </Section>

        <Section title="6. 開示・訂正・削除">
          <p>
            ユーザーは、設定画面からいつでも自身の登録情報を確認・変更できます。また、退会機能によりアカウントと全データを削除できます。その他の開示等のご請求は、運営者までお問い合わせください。
          </p>
        </Section>

        <Section title="7. ポリシーの変更">
          <p>
            本ポリシーの内容は、必要に応じて変更されることがあります。重要な変更がある場合は、本ページでお知らせします。
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 GoalTrack</span>
          <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            利用規約
          </Link>
        </div>
      </div>
    </div>
  );
}
