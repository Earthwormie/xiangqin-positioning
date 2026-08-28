import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("qr");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "请选择要上传的图片。" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "只支持 JPG / PNG / WebP 图片。" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "图片不能超过 5MB。" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = EXT[file.type] || "jpg";
  // 带时间戳文件名，避免浏览器缓存旧图
  const fname = `qr_${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fname), buf);

  // 走 API 路由读取（实时从磁盘读，next start 与 Docker 都稳）
  const publicPath = `/api/uploads/${fname}`;
  await setSetting(SETTING_KEYS.qrImage, publicPath);

  return NextResponse.json({ ok: true, qrImage: publicPath });
}
