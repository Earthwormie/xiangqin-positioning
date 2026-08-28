# ---- 依赖与构建阶段 ----
# 基础镜像走国内镜像源（1ms.run），避免 docker.io 拉取慢/失败
FROM docker.1ms.run/library/node:20-slim AS builder

WORKDIR /app

# 系统依赖：prisma 需要 openssl
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 先装依赖（利用层缓存）
COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --no-audit --no-fund

# 拷贝源码并构建
COPY . .
ENV DATABASE_URL="file:/app/data/prod.db"
RUN npx prisma generate \
    && npm run build

# ---- 运行阶段 ----
FROM docker.1ms.run/library/node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/app/data/prod.db"

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# standalone 产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 兜底二维码放在 /app 根（public 会被外部卷挂载覆盖，这里不会）
COPY --from=builder /app/public/uploads/qr.jpg ./_default_qr.jpg

# prisma schema + 引擎 + CLI（容器启动时建/迁移库）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
