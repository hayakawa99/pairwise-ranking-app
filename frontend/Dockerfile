FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y tree

COPY package*.json ./
RUN npm install

COPY . .

ENV PATH=/app/node_modules/.bin:$PATH

RUN tree -I 'node_modules|.next|.git' -a -L 3 > /app/directory_structure.txt

EXPOSE 3000

CMD ["npm", "run", "dev"]
