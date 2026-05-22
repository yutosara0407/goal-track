/**
 * ユーティリティ関数集
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

// ============================================================
// スタイルユーティリティ
// ============================================================

/**
 * TailwindCSSのクラス名を安全に結合する
 * clsxで条件分岐 + tailwind-mergeで競合クラスを解決
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// 日付ユーティリティ
// ============================================================

/**
 * 日付を日本語フォーマットで表示
 * 今日・昨日の場合は特別なラベルを返す
 */
export function formatDateJa(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return '今日';
  if (isYesterday(date)) return '昨日';
  return format(date, 'M月d日(E)', { locale: ja });
}

/**
 * YYYY-MM-DD形式で今日の日付を返す
 */
export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 年月を日本語形式で表示（例: "2024年6月"）
 */
export function formatMonthJa(year: number, month: number): string {
  return `${year}年${month}月`;
}

/**
 * 達成率をパーセント文字列に変換（例: 0.75 → "75%"）
 */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

// ============================================================
// カラーユーティリティ
// ============================================================

/** 目標カラー選択肢（HEXコード） */
export const GOAL_COLORS = [
  '#6366f1', // インディゴ（デフォルト）
  '#8b5cf6', // バイオレット
  '#ec4899', // ピンク
  '#ef4444', // レッド
  '#f97316', // オレンジ
  '#eab308', // イエロー
  '#22c55e', // グリーン
  '#06b6d4', // シアン
  '#3b82f6', // ブルー
  '#64748b', // スレート
] as const;

/**
 * 達成率に応じた色クラスを返す
 * 高い達成率ほど緑色、低いほど赤色
 */
export function getRateColorClass(rate: number): string {
  if (rate >= 0.8) return 'text-success-600';
  if (rate >= 0.5) return 'text-warning-600';
  return 'text-danger-500';
}

/**
 * 達成率に応じた背景色クラスを返す（カレンダーセル用）
 */
export function getRateBgClass(rate: number): string {
  if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (rate >= 0.8) return 'bg-success-500';
  if (rate >= 0.5) return 'bg-warning-500';
  return 'bg-danger-500';
}

/**
 * 達成率に応じた透明度クラスを返す（カレンダー表示のグラデーション用）
 */
export function getRateOpacity(rate: number): string {
  if (rate === 0) return 'opacity-10';
  if (rate < 0.25) return 'opacity-30';
  if (rate < 0.5) return 'opacity-50';
  if (rate < 0.75) return 'opacity-70';
  if (rate < 1) return 'opacity-85';
  return 'opacity-100';
}

// ============================================================
// バリデーションユーティリティ
// ============================================================

/**
 * APIエラーレスポンスからエラーメッセージを抽出する
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Axiosエラーの場合、バックエンドのメッセージを取得
    const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.errors) {
      // バリデーションエラーの場合、最初のエラーメッセージを返す
      const firstError = Object.values(axiosError.response.data.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
    return error.message;
  }
  return '予期しないエラーが発生しました';
}

// ============================================================
// ストリーク表示ユーティリティ
// ============================================================

/**
 * ストリーク日数を表示用テキストに変換
 */
export function formatStreak(days: number): string {
  if (days === 0) return '0日';
  if (days === 1) return '1日継続中！';
  if (days < 7) return `${days}日連続！`;
  if (days < 30) return `${days}日連続🔥`;
  return `${days}日連続🔥🔥`;
}
