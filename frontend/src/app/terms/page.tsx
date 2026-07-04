import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '利用規約 | GoalTrack',
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

export default function TermsPage() {
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

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">利用規約</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-10">最終更新日: 2026年7月4日</p>

        <Section title="第1条（適用）">
          <p>
            本規約は、GoalTrack（以下「本サービス」）の利用条件を定めるものです。登録ユーザーの皆さま（以下「ユーザー」）には、本規約に同意のうえ本サービスをご利用いただきます。
          </p>
        </Section>

        <Section title="第2条（利用登録）">
          <p>
            利用登録は、登録希望者が本規約に同意のうえ所定の方法で申請することで完了します。運営者は、不正な登録と判断した場合、登録を取り消すことがあります。
          </p>
        </Section>

        <Section title="第3条（アカウント管理）">
          <p>
            ユーザーは、自己の責任においてメールアドレスおよびパスワードを管理するものとします。第三者による不正利用について、運営者は故意または重過失がある場合を除き責任を負いません。
          </p>
        </Section>

        <Section title="第4条（禁止事項）">
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスのサーバーまたはネットワークに過度な負荷をかける行為</li>
            <li>不正アクセス、またはこれを試みる行為</li>
            <li>他のユーザーまたは第三者に不利益・損害を与える行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="第5条（本サービスの提供の停止等）">
          <p>
            運営者は、システムの保守・障害・その他やむを得ない事由により、ユーザーへの事前通知なく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
        </Section>

        <Section title="第6条（ユーザーデータ）">
          <p>
            ユーザーが本サービスに登録した目標・達成記録などのデータの権利はユーザーに帰属します。運営者は、サービスの提供・改善の目的でのみこれらのデータを取り扱います。
          </p>
        </Section>

        <Section title="第7条（退会）">
          <p>
            ユーザーは、設定画面の退会機能によりいつでも退会できます。退会した場合、アカウントおよび登録データは削除され、復元できません。
          </p>
        </Section>

        <Section title="第8条（免責事項）">
          <p>
            本サービスは無料で提供される個人運営のサービスであり、その完全性・正確性・継続性を保証するものではありません。本サービスの利用によりユーザーに生じた損害について、運営者は故意または重過失がある場合を除き責任を負いません。
          </p>
        </Section>

        <Section title="第9条（規約の変更）">
          <p>
            運営者は、必要と判断した場合、本規約を変更できるものとします。変更後の規約は、本ページに掲載した時点から効力を生じます。
          </p>
        </Section>

        <Section title="第10条（準拠法・裁判管轄）">
          <p>
            本規約の解釈にあたっては日本法を準拠法とし、本サービスに関して紛争が生じた場合は、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 GoalTrack</span>
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </div>
  );
}
