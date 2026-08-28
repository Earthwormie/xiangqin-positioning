import { NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/settings";
import { setAdminAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const real = await getAdminPassword();
  if (!password || String(password) !== real) {
    return NextResponse.json({ ok: false, error: "管理员密码不正确。" }, { status: 401 });
  }
  await setAdminAuth();
  return NextResponse.json({ ok: true });
}
