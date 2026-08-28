#!/usr/bin/env bash
#
# 相亲定位测评 · 一键部署脚本
# 用法：把 deploy.sh、docker-compose.yml、xiangqin-image.tar 放在同一目录，
#       然后在服务器上执行：  sudo bash deploy.sh
#
set -e

IMAGE_TAR="xiangqin-image.tar"
IMAGE_NAME="xiangqin-positioning:latest"
COMPOSE_FILE="docker-compose.yml"

echo "=============================================="
echo "   相亲定位测评 · 一键部署"
echo "=============================================="

# 1. 检查 docker
if ! command -v docker >/dev/null 2>&1; then
  echo "[✗] 未检测到 Docker。请先安装 Docker：https://docs.docker.com/engine/install/"
  echo "    Ubuntu/Debian 可执行：curl -fsSL https://get.docker.com | sh"
  exit 1
fi

# 2. 确定 compose 命令（新版 docker compose / 旧版 docker-compose）
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "[✗] 未检测到 docker compose。请安装 Docker Compose 插件。"
  exit 1
fi
echo "[✓] Docker 就绪，使用：$COMPOSE"

# 3. 载入镜像
if [ -f "$IMAGE_TAR" ]; then
  echo "[·] 正在载入镜像 $IMAGE_TAR ..."
  docker load -i "$IMAGE_TAR"
  echo "[✓] 镜像已载入"
else
  if docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo "[✓] 本地已有镜像 $IMAGE_NAME，跳过载入"
  else
    echo "[✗] 找不到 $IMAGE_TAR，且本地无镜像。请把镜像包放到当前目录。"
    exit 1
  fi
fi

# 4. 准备挂载目录（数据库 + 上传资源，持久化，不随代码更新重置）
mkdir -p ./data ./public/uploads
echo "[✓] 数据目录：$(pwd)/data   （数据库）"
echo "[✓] 资源目录：$(pwd)/public （二维码等上传文件）"

# 5. 生成 AUTH_SECRET（仅首次），写入 .env
if [ ! -f ".env" ]; then
  SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  echo "AUTH_SECRET=$SECRET" > .env
  echo "[✓] 已生成随机 AUTH_SECRET 并写入 .env"
else
  echo "[✓] 复用已有 .env"
fi

# 6. 启动
echo "[·] 正在启动服务 ..."
$COMPOSE -f "$COMPOSE_FILE" up -d

echo ""
echo "=============================================="
echo "   部署完成 ✓"
echo "=============================================="
echo " 访问地址：https://你的域名        （容器 443）"
echo " 后台地址：https://你的域名/admin"
echo ""
echo " 默认用户测评密码：6688"
echo " 默认后台管理密码：admin8888"
echo " ⚠ 请登录 /admin 后立即修改这两个密码。"
echo ""
echo " 说明："
echo "  · 容器监听 HTTP，已映射到宿主机 443 端口。"
echo "  · HTTPS 证书请在服务器的 Nginx / 宝塔 / Cloudflare 反代层配置。"
echo "  · 数据库在 ./data，上传文件在 ./public，均已持久化，"
echo "    重新部署新版本镜像不会清空它们。"
echo ""
echo " 常用命令："
echo "  查看日志： $COMPOSE logs -f"
echo "  停止服务： $COMPOSE down"
echo "  更新版本： 载入新 tar 后重新执行本脚本"
echo "=============================================="
