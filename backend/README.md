#DB 変更手順(多分)

- docker のコンテナ？に入る
  <!-- docker exec -it pairwise-ranking-app_backend_1 bash -->

  docker exec -it pairwise-ranking-app-backend-1 bash

- backend/app/db/models/(変更する場所).py に変更内容を書く

- コンテナ内で以下のコマンド

- マイグレーションファイルが作られる
  alembic revision --autogenerate -m "メッセージ"

- 反映
  alembic upgrade head

#seeds を流し込む(嘘)
docker exec -it pairwise-ranking-app-backend-1 python app/seeds/seed_data.py

#テストコマンド
docker-compose run --rm backend-test pytest

#seedsを流し込むコマンド

#コンテナに入る
docker exec -it pairwise-ranking-app-backend-1 /bin/bash
#seedsを流し込む
python -m app.seeds.seed_data

マイグレーションで問題が起きた時

#先頭を確認
alembic heads
例)
xxxxxxxxxx (head)
yyyyyyyyyy (head)
#出てきた2つを統合
alembic merge -m "merge heads" xxxxxxxxxx yyyyyyyyyy
再度マイグレーションを適用
alembic upgrade head