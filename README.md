# GoalTrack - 目標達成管理アプリ

日々の目標をチェック形式で記録し、習慣化を支援するWebアプリケーション。

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS + カスタムコンポーネント |
| 状態管理 | TanStack Query (サーバー状態) + Zustand (クライアント状態) |
| フォーム | React Hook Form + Zod |
| チャート | Recharts |
| バックエンド | Laravel 11 (PHP 8.2+) |
| 認証 | Laravel Sanctum (APIトークン方式) |
| データベース | SQLite (開発) / MySQL (本番) |

## 機能一覧

- **ダッシュボード**: 今日の目標チェック、達成率統計、ストリークランキング
- **目標管理**: 目標の追加・編集・削除・アーカイブ、カラー設定
- **カレンダービュー**: 月次ヒートマップで達成状況を可視化
- **履歴・分析**: 期間フィルター付き達成履歴、棒グラフによる傾向把握
- **認証**: ユーザー登録・ログイン（マルチユーザー対応）

---

## セットアップ手順

### 前提条件

- PHP 8.2 以上
- Composer
- Node.js 18 以上
- npm または yarn

### 1. リポジトリのセットアップ

```bash
# このディレクトリ（goal-achievement-app）に移動済みであることを確認
```

### 2. バックエンド（Laravel）のセットアップ

```bash
# Laravelプロジェクトを作成（backendディレクトリに）
composer create-project laravel/laravel backend

# 作成したプロジェクトに移動
cd backend

# Laravel Sanctumをインストール
composer require laravel/sanctum

# 必要なコンポーネントのインストール（必要に応じて）
composer install

# 環境変数ファイルを作成
cp ../backend/.env.example .env

# アプリケーションキーを生成
php artisan key:generate

# SQLiteデータベースファイルを作成
touch database/database.sqlite

# Sanctumの設定をpublish
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### 提供されているファイルをコピー

```bash
# ※ goal-achievement-app/backend/ にある各ファイルを
#    新しく作成したLaravelプロジェクトの同じパスにコピーする

# マイグレーションファイルをコピー
cp -r ../backend/database/migrations/2024_* database/migrations/

# モデルをコピー
cp ../backend/app/Models/Goal.php app/Models/
cp ../backend/app/Models/GoalCompletion.php app/Models/
cp ../backend/app/Models/User.php app/Models/    # 既存ファイルを上書き

# コントローラーをコピー（ディレクトリ作成が必要）
mkdir -p app/Http/Controllers/Api
cp -r ../backend/app/Http/Controllers/Api/* app/Http/Controllers/Api/

# フォームリクエストをコピー
mkdir -p app/Http/Requests/Auth app/Http/Requests/Goal app/Http/Requests/Completion
cp ../backend/app/Http/Requests/Auth/* app/Http/Requests/Auth/
cp ../backend/app/Http/Requests/Goal/* app/Http/Requests/Goal/
cp ../backend/app/Http/Requests/Completion/* app/Http/Requests/Completion/

# ポリシーをコピー
mkdir -p app/Policies
cp ../backend/app/Policies/GoalPolicy.php app/Policies/

# APIルートを上書き
cp ../backend/routes/api.php routes/api.php
```

#### CORSとSanctumの設定

```php
// config/cors.php を編集して CORS を許可
// 'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')]

// app/Http/Kernel.php の API ミドルウェアグループに Sanctum を追加（Laravel 11の場合はbootstrap/app.phpで設定）
```

#### `bootstrap/app.php` にSanctumミドルウェアを追加（Laravel 11）

```php
// bootstrap/app.php に以下を追加:
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

#### AuthServiceProviderでGoalPolicyを登録

```php
// app/Providers/AuthServiceProvider.php
protected $policies = [
    \App\Models\Goal::class => \App\Policies\GoalPolicy::class,
];
```

#### マイグレーション実行

```bash
# .envのDB_CONNECTIONがsqliteになっていることを確認してから実行
php artisan migrate

# 開発サーバーを起動（デフォルトはhttp://localhost:8000）
php artisan serve
```

---

### 3. フロントエンド（Next.js）のセットアップ

```bash
# frontendディレクトリに移動（goal-achievement-app/frontend）
cd ../frontend

# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local

# .env.local を編集してバックエンドのURLを確認
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 開発サーバーを起動（http://localhost:3000）
npm run dev
```

---

### 4. 動作確認

1. ブラウザで `http://localhost:3000` を開く
2. 「新規登録」からアカウントを作成
3. ダッシュボードで目標を追加してチェックしてみる

---

## ディレクトリ構成

```
goal-achievement-app/
├── backend/                    # Laravel バックエンド（コピー用ファイル）
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # 認証・目標・達成記録・統計コントローラー
│   │   │   └── Requests/         # フォームリクエスト（バリデーション）
│   │   ├── Models/               # Eloquentモデル
│   │   └── Policies/             # 認可ポリシー
│   ├── database/migrations/      # DBマイグレーション
│   └── routes/api.php            # APIルート定義
│
└── frontend/                   # Next.js フロントエンド
    └── src/
        ├── app/                  # Next.js App Router ページ
        │   ├── (auth)/           # 認証ページ（ログイン・登録）
        │   └── (dashboard)/      # ダッシュボード系ページ
        ├── components/           # Reactコンポーネント
        │   ├── layout/           # Header・Sidebar
        │   ├── dashboard/        # ダッシュボード用コンポーネント
        │   ├── goals/            # 目標管理コンポーネント
        │   ├── calendar/         # カレンダーコンポーネント
        │   └── ui/               # 汎用UIコンポーネント
        ├── hooks/                # カスタムフック
        ├── lib/                  # APIクライアント・ユーティリティ
        ├── store/                # Zustand認証ストア
        └── types/                # TypeScript型定義
```

## 次回以降の起動方法

セットアップ完了後は、以下のコマンドでサーバーを起動します。

### バックエンド（Laravel）

```bash
export PATH="$HOME/homebrew/bin:$HOME/homebrew/sbin:$PATH"
cd ~/Claude/ClaudeCodeTest/goal-achievement-app/backend
php artisan serve --port=8000
```

### フロントエンド（Next.js）

別ターミナルで実行：

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
cd ~/Claude/ClaudeCodeTest/goal-achievement-app/frontend
npm run dev
```

起動後、ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 今後の拡張予定

- [ ] プッシュ通知（毎日リマインダー）
- [ ] 目標のカテゴリー・タグ機能
- [ ] 友達との目標共有・応援機能
- [ ] データエクスポート（CSV）
- [ ] ダークモード切り替えボタン
- [ ] ネイティブアプリ（React Native）への移植
