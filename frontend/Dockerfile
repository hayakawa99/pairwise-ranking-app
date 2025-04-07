FROM node:18

WORKDIR /app

# 依存ファイルだけ先にコピー（キャッシュ効かせる）
COPY package*.json ./

RUN npm install

# アプリ本体をコピー
COPY . .

# パスを通す（←ここ重要）
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["next", "dev"]
