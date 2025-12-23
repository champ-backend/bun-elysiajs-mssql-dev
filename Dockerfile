FROM oven/bun:latest

RUN apt-get update && apt-get install -y ufw
RUN ufw allow 80
RUN ufw allow 443

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
RUN bun add -g cross-env


COPY prisma ./prisma
RUN bunx prisma generate --schema=prisma/schema.prisma

COPY . .

CMD ["bun", "run", "localhost"]
