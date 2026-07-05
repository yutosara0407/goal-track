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
  /** 検索に使う一意なID（半角英数・_.-、10文字以内、小文字）。未設定の場合はnull */
  username: string | null;
  email: string;
  bio: string | null;
  is_public: boolean;
  /** フォロワーのタイムラインに実績を公開するか（is_publicとは独立） */
  share_timeline: boolean;
  /** share_timeline=trueの場合に、日次ノートも一緒に公開するか */
  share_timeline_notes: boolean;
  created_at: string;
  updated_at: string;
}

/** ユーザー検索・一覧表示用のサマリー（メールアドレスは含まれない） */
export interface UserSummary {
  id: number;
  name: string;
  username: string | null;
  bio: string | null;
  is_public: boolean;
  followers_count: number;
  is_following: boolean;
}

/** 公開プロフィールの達成統計 */
export interface ProfileStats {
  active_goals: number;
  total_completed: number;
  active_days: number;
  best_current_streak: number;
  month_completion_rate: number;
}

/** 公開プロフィール */
export interface UserProfile {
  id: number;
  name: string;
  username: string | null;
  is_public: boolean;
  is_self: boolean;
  is_following: boolean;
  joined_at: string;
  bio: string | null;
  followers_count: number | null;
  following_count: number | null;
  stats: ProfileStats | null;
  achievements: string[] | null;
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
  /** アーカイブした日時（アクティブ時はnull）。統計上はこの前日まで存在していた扱い */
  archived_at: string | null;
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

/** メッセージのみのAPIレスポンス */
export interface MessageResponse {
  message: string;
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
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** パスワード再設定メール送信フォーム */
export interface ForgotPasswordFormData {
  email: string;
}

/** パスワード再設定フォーム */
export interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** プロフィール更新フォーム */
export interface UpdateProfileFormData {
  name: string;
  username?: string | null;
  email: string;
  bio?: string | null;
  is_public?: boolean;
  share_timeline?: boolean;
  share_timeline_notes?: boolean;
}

/** パスワード変更フォーム */
export interface UpdatePasswordFormData {
  current_password: string;
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

/** 日次ノート（ユーザー単位の日記。目標ごとのメモとは別物） */
export interface DailyNote {
  date: string;
  body: string | null;
}

/** タイムラインの1エントリ（フォロー中ユーザーの1日分の達成状況） */
export interface TimelineEntry {
  user: {
    id: number;
    name: string;
    username: string | null;
  };
  date: string;
  completed_count: number;
  total_goals: number;
  completion_rate: number;
  note: string | null;
}

// ============================================================
// UIコンポーネント型
// ============================================================

/** ボタンのバリアント */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** バッジのバリアント */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
