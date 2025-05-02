#!/bin/bash
set -e

# .env を読み込んで環境変数化
export $(cat .env | xargs)

# マイグレーション
alembic upgrade head

# ディレクトリ構成を出力
tree /app /frontend -I 'node_modules|.next|__pycache__|*.pyc|.git' -a -L 4 > /app/directory_structure.txt

# アプリ起動
uvicorn app.main:app --host 0.0.0.0 --port 8000
