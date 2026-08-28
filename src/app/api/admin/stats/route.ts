import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const total = await prisma.submission.count();
  const withWechat = await prisma.submission.count({ where: { NOT: { wechat: null } } });
  return NextResponse.json({ total, withWechat });
}
