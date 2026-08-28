import { NextResponse } from "next/server";
import { getUserPassword } from "@/lib/settings";
import { setUserUnlocked } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const real = await getUserPassword();
  if (!password || String(password).trim() !== real) {
    return NextResponse.json({ ok: false, error: "密码不正确。请核对后重试，或联系卖家获取。" }, { status: 401 });
  }
  await setUserUnlocked();
  return NextResponse.json({ ok: true });
}
