#DB 変更手順(多分)

- docker のコンテナ？に入る
  <!-- docker exec -it pairwise-ranking-app_backend_1 bash -->
  docker exec -it pairwise-ranking-app-backend-1 bash


- backend/app/db/models/(変更する場所).pyに変更内容を書く

- コンテナ内で以下のコマンド

- マイグレーションファイルが作られる
  alembic revision --autogenerate -m "メッセージ"

- 反映
  alembic upgrade head
