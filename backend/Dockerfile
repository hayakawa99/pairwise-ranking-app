FROM python:3.10

WORKDIR /app

ENV PYTHONPATH=/app

# treeコマンドのためにインストール
RUN apt-get update && apt-get install -y tree

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY ./alembic ./alembic
COPY ./app /app

# ディレクトリ構成を出力（node_modules 等を除外）
RUN tree -I 'node_modules|__pycache__|*.pyc|.git' -a -L 3 > /app/directory_structure.txt

# 起動時にマイグレーションしてアプリ起動
CMD ["bash", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
