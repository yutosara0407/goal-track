import type { MetadataRoute } from 'next';

/**
 * PWA用Webマニフェスト
 * アイコンはヘッダー・favicon(icon.svg)と同じブランドマーク（テーマカラーのTargetアイコン、背景は透過）
 *
 * 注意: maskable purposeは意図的に宣言しない。AndroidのMaskable Icon仕様は
 * セーフゾーン全体を不透明で塗ることを前提としており、透過背景のアイコンを
 * maskableとして宣言するとOSのマスク適用時に見た目が崩れるため。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GoalTrack - 目標達成管理アプリ',
    short_name: 'GoalTrack',
    description: '日々の目標を登録・記録して、習慣を形成するアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
