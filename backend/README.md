DB 変更手順(多分)

backend/app/db/models/(変更する場所).py
に変更内容を書く

docker のコンテナ？に入る
docker exec -it pairwise-ranking-app_backend_1 bash

コンテナ内で以下のコマンド

マイグレーションファイルが作られる
alembic revision --autogenerate -m "メッセージ"

反映
alembic upgrade head
