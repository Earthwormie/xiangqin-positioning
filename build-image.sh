#!/usr/bin/env bash
#
# 构建 Docker 镜像 → 导出镜像包 → 组装部署产物到 dist/
# 目标架构 amd64（linux/amd64），用于绝大多数 Linux 云服务器。
#
set -e

IMAGE_NAME="xiangqin-positioning:latest"
PLATFORM="linux/amd64"
DIST="dist"

echo "=============================================="
echo "  构建相亲定位测评镜像 ($PLATFORM)"
echo "=============================================="

# 1. 构建（指定 amd64，Apple Silicon 上通过 QEMU 交叉构建）
echo "[·] docker build ..."
docker build --platform "$PLATFORM" -t "$IMAGE_NAME" .
echo "[✓] 镜像构建完成：$IMAGE_NAME"

# 2. 导出镜像 tar
mkdir -p "$DIST"
echo "[·] 导出镜像包 ..."
docker save -o "$DIST/xiangqin-image.tar" "$IMAGE_NAME"
echo "[✓] 已导出：$DIST/xiangqin-image.tar"

# 3. 拷贝部署所需文件
cp docker-compose.yml "$DIST/"
cp deploy.sh "$DIST/"

echo ""
echo "=============================================="
echo "  完成 ✓  部署产物在 ./$DIST/"
echo "=============================================="
ls -lh "$DIST/"
echo ""
echo " 把 dist/ 里的三个文件传到服务器同一目录，执行："
echo "   sudo bash deploy.sh"
echo "=============================================="
