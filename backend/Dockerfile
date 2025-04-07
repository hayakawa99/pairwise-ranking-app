FROM python:3.10

# 作業ディレクトリ
WORKDIR /app

# ソースコードをコピー
COPY ./app /app

# 環境変数ファイルをコンテナにコピー（.env使用時に備えて）
COPY .env /app/.env

# 依存ライブラリをインストール
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv

# アプリ起動コマンド（FastAPI + Uvicorn）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
