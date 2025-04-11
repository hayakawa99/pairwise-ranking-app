# 🆚 Pairwise Ranking App

2択比較によってあらゆる選択肢を評価・ランク付けできるアプリケーションです。  
ユーザーが「お題」と選択肢を投稿し、他ユーザーがランダムな2択比較に投票。  
その結果に基づきEloレーティングでランキングを形成します。

---

## 📦 技術構成

- **フロントエンド**: Next.js (App Router, TypeScript)
- **バックエンド**: FastAPI
- **データベース**: PostgreSQL（※今後導入予定）
- **インフラ**: Docker + Docker Compose

---

## 🚀 起動方法（開発環境）

### 前提

- Docker / Docker Compose がインストール済み

### 手順

```bash
# リポジトリをClone
git clone git@github.com:hayakawa99/pairwise-ranking-app.git
cd pairwise-ranking-app

# 必要に応じてブランチ切り替え（例：devブランチ）
git checkout dev

# ビルド＆起動
docker compose up --build