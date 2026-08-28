import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// 实时从磁盘读取 uploads 里的图片（避免 next start 静态目录快照导致新图 404）
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // 只允许安全文件名，防目录穿越
  if (!/^[A-Za-z0-9._-]+$/.test(file) || file.includes("..")) {
    return new NextResponse("bad request", { status: 400 });
  }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext];
  if (!type) return new NextResponse("unsupported", { status: 415 });

  try {
    const buf = await readFile(path.join(UPLOAD_DIR, file));
    return new NextResponse(buf, {
      headers: { "Content-Type": type, "Cache-Control": "no-cache" },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
