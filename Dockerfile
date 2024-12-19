From node:20-alpine

WORKDIR /app

COPY package.json /app

RUN corepack enable pnpm

RUN pnpm install

COPY . .

EXPOSE 8080

CMD ["pnpm", "test"]