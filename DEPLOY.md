# GoalTrack デプロイガイド

MacBook Pro 2011 (Ubuntu) + KVM仮想マシン + Cloudflare Tunnel を使った  
**費用ゼロ**のホームサーバー公開手順。

## 全体構成

```
インターネット
     ↓  Cloudflare Tunnel（無料・HTTPS自動）
MacBook Pro 2011（Ubuntu ホスト）
     ↓  Multipass / KVM（仮想マシン）
Ubuntu Server VM
     ↓  Docker Compose
┌─────────────────────────────┐
│  Nginx :80（リバースプロキシ）  │
│  ├─ /api/* → PHP-FPM        │
│  └─ /*    → Next.js :3000   │
│                             │
│  backend (PHP 8.3-FPM)      │
│  └── SQLite DB              │
└─────────────────────────────┘
```

---

## ステップ 1: ホストマシン（MacBook Ubuntu）の準備

### 1-1. KVM が使えるか確認

MacBook Pro 2011 は Intel VT-x に対応しているので通常は動作します。

```bash
# 1以上であればKVM利用可
egrep -c '(vmx|svm)' /proc/cpuinfo

# KVM モジュール確認
lsmod | grep kvm
```

KVM モジュールが無い場合:

```bash
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system
sudo modprobe kvm_intel
```

### 1-2. Multipass インストール（軽量VMマネージャー）

Multipass は Ubuntu 公式の KVM ベース VM ツールです。

```bash
sudo snap install multipass
```

---

## ステップ 2: Ubuntu Server VM の作成

```bash
# CPU 2コア、RAM 2GB、ディスク 20GB の VM を作成
multipass launch 22.04 --name goal-track --cpus 2 --memory 2G --disk 20G

# VMにシェルで入る
multipass shell goal-track
```

> MacBook Pro 2011 の RAM が 4GB の場合は `--memory 1G` に変更してください。

### VM 基本情報の確認

```bash
# VMのIPアドレスを確認（ホストから）
multipass info goal-track
```

---

## ステップ 3: VM 内のセットアップ

以下は **VM 内** で実行します（`multipass shell goal-track` でVM内に入った状態）。

### 3-1. Docker インストール

```bash
# 依存関係インストール
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# Docker 公式 GPG キー追加
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Docker リポジトリ追加
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker インストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# sudo なしで使えるようにする
sudo usermod -aG docker $USER
newgrp docker

# 動作確認
docker --version
docker compose version
```

### 3-2. Git とリポジトリのクローン

```bash
sudo apt install -y git

git clone https://github.com/yutosara0407/goal-track.git
cd goal-track
```

---

## ステップ 4: Cloudflare Tunnel のセットアップ（無料 HTTPS URL 取得）

Cloudflare Tunnel はポート開放なし・固定IP不要で外部公開できます。

### 4-1. cloudflared インストール

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

### 4-2. 方法A: クイックトンネル（アカウント不要・一時URL）

**お試し用**。再起動のたびにURLが変わります。

```bash
cloudflared tunnel --url http://localhost:80
# → https://xxxxxxxx.trycloudflare.com のようなURLが表示される
```

### 4-3. 方法B: 名前付きトンネル（恒久URL・推奨）

1. [Cloudflare](https://dash.cloudflare.com/) で無料アカウントを作成
2. ドメインを持っている場合はCloudflareに追加（DNSを委任）
3. VM内で認証:

```bash
cloudflared tunnel login
# ブラウザが開くので認証する
```

4. トンネル作成:

```bash
cloudflared tunnel create goal-track
# → トンネルIDが表示される（例: abc123...）
```

5. DNSレコード設定（独自ドメインがある場合）:

```bash
cloudflared tunnel route dns goal-track goals.yourdomain.com
```

6. 設定ファイル作成:

```bash
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <トンネルID>
credentials-file: /home/ubuntu/.cloudflared/<トンネルID>.json

ingress:
  - service: http://localhost:80

EOF
```

7. systemd サービスとして登録:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## ステップ 5: 環境変数の設定

**クイックトンネルの場合**: 起動後にURLを確認してから以下を設定します。  
**名前付きトンネルの場合**: 先にURLが決まっているので今設定できます。

### 5-1. プロジェクトルートの `.env`

```bash
cd ~/goal-track
cp .env.example .env
nano .env
```

```
NEXT_PUBLIC_API_URL=https://your-tunnel-domain.trycloudflare.com/api
```

`your-tunnel-domain.trycloudflare.com` を実際のURLに変更してください。

### 5-2. バックエンドの `.env`

```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```

変更が必要な箇所:

```
APP_URL=https://your-tunnel-domain.trycloudflare.com
FRONTEND_URL=https://your-tunnel-domain.trycloudflare.com
```

### 5-3. Laravel アプリキーの生成

```bash
# 一時的にコンテナで生成
docker run --rm -v $(pwd)/backend:/app -w /app \
  composer:2 php artisan key:generate --show
```

表示された `base64:...` の値を `backend/.env` の `APP_KEY=` に設定します。

---

## ステップ 6: Docker Compose でビルド・起動

```bash
cd ~/goal-track

# イメージのビルド（初回は数分かかります）
docker compose build

# バックグラウンドで起動
docker compose up -d

# ログ確認
docker compose logs -f
```

### 動作確認

```bash
# コンテナが全部 running になっているか確認
docker compose ps

# バックエンドのログ
docker compose logs backend

# フロントエンドのログ
docker compose logs frontend
```

ブラウザで `https://your-tunnel-domain.trycloudflare.com` にアクセスして  
GoalTrack のログイン画面が表示されれば成功です。

---

## ステップ 7: VM の自動起動設定

MacBook を再起動したとき、VMとアプリが自動で起動するように設定します。

### 7-1. VM の自動起動（ホスト Ubuntu 側）

```bash
# ホストマシン（MacBook）で実行
sudo systemctl enable snap.multipass.multipassd
```

### 7-2. Docker Compose の自動起動（VM 内）

```bash
# VM 内で実行
sudo nano /etc/systemd/system/goal-track.service
```

以下を貼り付けます:

```ini
[Unit]
Description=GoalTrack Docker Compose
Requires=docker.service
After=docker.service network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/goal-track
ExecStart=docker compose up
ExecStop=docker compose down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable goal-track
```

---

## 更新デプロイ手順

コードを変更した後の再デプロイ:

```bash
cd ~/goal-track
git pull
docker compose down
docker compose build
docker compose up -d
```

---

## トラブルシューティング

### コンテナが起動しない

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
```

### SQLite のパーミッションエラー

```bash
docker compose exec backend chown -R www-data:www-data /var/www/html/database
```

### Cloudflare Tunnel が繋がらない

```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50
```

### VM にアクセスできない

```bash
# ホスト側で VM の状態確認
multipass list
multipass shell goal-track
```

### MacBook のリソース状況確認

```bash
# ホスト側で確認
free -h
htop
```

---

## リソース見積もり（MacBook Pro 2011）

| コンポーネント | RAM使用量 |
|------------|---------|
| ホスト Ubuntu | 800MB〜1.5GB |
| Multipass VM | 設定値通り（1〜2GB推奨） |
| Nginx コンテナ | ~10MB |
| PHP-FPM コンテナ | ~50MB |
| Next.js コンテナ | ~100MB |
| **合計** | **約2〜4GB** |

MacBook Pro 2011 が 4GB RAM の場合は VM を `--memory 1G` に設定することを推奨します。  
8GB RAM であれば余裕を持って動作します。

---

## コスト

| 項目 | 費用 |
|------|------|
| MacBook Pro 2011 | 手持ち（0円） |
| Ubuntu | 無料 |
| Multipass / KVM | 無料 |
| Docker | 無料 |
| Cloudflare Tunnel | **無料**（無料プランで利用可） |
| 独自ドメイン（任意） | ~1,000〜1,500円/年 |
| **合計** | **0円〜1,500円/年** |
