import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isUserUnlocked } from "@/lib/auth";
import { genReportCode } from "@/lib/settings";
import { computeScore, tierOf, buildPortraits } from "@/lib/scoring";

export async function POST(req: Request) {
  if (!(await isUserUnlocked())) {
    return NextResponse.json({ ok: false, error: "会话已失效，请返回重新验证密码。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.answers || (body.answers.gender !== "male" && body.answers.gender !== "female")) {
    return NextResponse.json({ ok: false, error: "提交数据不完整。" }, { status: 400 });
  }
  const answers = body.answers as Record<string, any>;

  const { total, dims } = computeScore(answers);
  const tier = tierOf(total);
  const { ideal, base } = buildPortraits(total, answers);
  const code = await genReportCode();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent") || null;

  await prisma.submission.create({
    data: {
      code,
      gender: answers.gender,
      answers: JSON.stringify(answers),
      dims: JSON.stringify(dims),
      total,
      tierKey: tier.key,
      tierName: tier.name,
      ideal: JSON.stringify(ideal),
      base: JSON.stringify(base),
      wechat: body.wechat ? String(body.wechat).slice(0, 64) : null,
      wechatWant: body.wechatWant ? String(body.wechatWant).slice(0, 32) : null,
      ip,
      ua,
    },
  });

  return NextResponse.json({ ok: true, code, total, dims, tierKey: tier.key, ideal, base });
}
