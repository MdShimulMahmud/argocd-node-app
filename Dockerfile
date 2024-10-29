FROM node:23-alpine3.19

WORKDIR /app

COPY . /app

COPY package*.json /app

RUN npm install

VOLUME ["/app/data"]

EXPOSE 5000

CMD ["node", "src/index.js"]