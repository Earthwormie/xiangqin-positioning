import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isUserUnlocked } from "@/lib/auth";

// 报告页补录微信号 / 想解决的问题（钩子题留资）
export async function POST(req: Request) {
  if (!(await isUserUnlocked())) {
    return NextResponse.json({ ok: false, error: "会话已失效。" }, { status: 401 });
  }
  const { code, wechat, want } = await req.json().catch(() => ({}));
  if (!code || !wechat) {
    return NextResponse.json({ ok: false, error: "缺少必要信息。" }, { status: 400 });
  }
  const sub = await prisma.submission.findUnique({ where: { code: String(code) } });
  if (!sub) {
    return NextResponse.json({ ok: false, error: "报告不存在。" }, { status: 404 });
  }
  await prisma.submission.update({
    where: { code: String(code) },
    data: {
      wechat: String(wechat).slice(0, 64),
      wechatWant: want ? String(want).slice(0, 32) : sub.wechatWant,
    },
  });
  return NextResponse.json({ ok: true });
}
