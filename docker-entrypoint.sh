#!/bin/sh
set -e

# 确保挂载目录存在（外部卷挂进来时可能是空的）
mkdir -p /app/data /app/public/uploads

# 首次启动：如果数据库不存在，用 prisma 建表；已存在则同步 schema（幂等）
echo "[entrypoint] syncing database schema..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss || \
  npx prisma db push --skip-generate

# 如果 uploads 里没有默认二维码，从镜像内置的兜底图补一张
if [ ! -f /app/public/uploads/qr.jpg ] && [ -f /app/_default_qr.jpg ]; then
  cp /app/_default_qr.jpg /app/public/uploads/qr.jpg
  echo "[entrypoint] restored default QR image"
fi

echo "[entrypoint] starting Next.js server on :3000"
exec node server.js
