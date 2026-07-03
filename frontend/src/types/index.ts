/**
 * アプリケーション全体で使用するTypeScript型定義
 * バックエンドのAPIレスポンスの構造に対応している
 */

// ============================================================
// エンティティ型
// ============================================================

/** ユーザー */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/** 目標 */
export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  /** HEXカラーコード（例: '#6366f1'） */
  color: string;
  /** false の場合はアーカイブ済み */
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 目標達成記録 */
export interface GoalCompletion {
  id: number;
  goal_id: number;
  /** YYYY-MM-DD形式 */
  date: string;
  completed: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
  goal?: Goal;
}

// ============================================================
// APIレスポンス型
// ============================================================

/** 認証レスポンス（ログイン・登録時） */
export interface AuthResponse {
  user: User;
  token: string;
}

/** 1日の達成状況アイテム */
export interface DayCompletionItem {
  goal: Goal;
  date: string;
  completed: boolean;
  note: string | null;
  completion_id: number | null;
}

/** 特定日の全目標達成状況 */
export interface DayCompletions {
  date: string;
  items: DayCompletionItem[];
  completion_rate: number;
}

/** 月次カレンダーデータ（日別集計） */
export interface CalendarDay {
  date: string;
  completed_count: number;
  total_goals: number;
  completion_rate: number;
}

/** 月次カレンダーデータ（目標別集計） */
export interface GoalMonthlyStats {
  goal: Goal;
  completed_days: number;
  total_days: number;
  completion_rate: number;
  current_streak: number;
}

/** 月次カレンダーAPIレスポンス */
export interface MonthlyStatsResponse {
  year: number;
  month: number;
  days: CalendarDay[];
  goal_stats: GoalMonthlyStats[];
}

/** ストリーク情報 */
export interface StreakInfo {
  goal: Goal;
  streak: number;
}

/** ダッシュボード用サマリー統計 */
export interface OverviewStats {
  total_goals: number;
  active_goals: number;
  today_completion_rate: number;
  week_completion_rate: number;
  month_completion_rate: number;
  today_completed_count: number;
  current_streaks: StreakInfo[];
}

// ============================================================
// フォーム型
// ============================================================

/** ログインフォーム */
export interface LoginFormData {
  email: string;
  password: string;
}

/** 新規登録フォーム */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** 目標作成フォーム */
export interface GoalFormData {
  title: string;
  description?: string;
  color: string;
}

/** 達成記録トグルリクエスト */
export interface ToggleCompletionData {
  goal_id: number;
  date: string;
  completed: boolean;
  note?: string;
}

// ============================================================
// UIコンポーネント型
// ============================================================

/** ボタンのバリアント */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** バッジのバリアント */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
