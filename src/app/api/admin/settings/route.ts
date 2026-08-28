import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import {
  setSetting,
  getUserPassword,
  getQrImage,
  getWechatMode,
  getShowQr,
  getHookTitle,
  getHookBody,
} from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/config";

// 读取当前配置（后台展示用）
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    userPassword: await getUserPassword(),
    hookTitle: await getHookTitle(),
    hookBody: await getHookBody(),
    qrImage: await getQrImage(),
    wechatMode: await getWechatMode(),
    showQr: await getShowQr(),
  });
}

// 修改配置：用户密码 / 管理员密码 / 引流文案 / 微信必填模式 / 二维码显隐
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (typeof body.userPassword === "string" && body.userPassword.trim()) {
    await setSetting(SETTING_KEYS.userPassword, body.userPassword.trim());
  }
  if (typeof body.adminPassword === "string" && body.adminPassword.trim()) {
    if (body.adminPassword.trim().length < 4) {
      return NextResponse.json({ ok: false, error: "管理员密码至少 4 位。" }, { status: 400 });
    }
    await setSetting(SETTING_KEYS.adminPassword, body.adminPassword.trim());
  }
  if (typeof body.hookTitle === "string") {
    await setSetting(SETTING_KEYS.hookTitle, body.hookTitle.slice(0, 200));
  }
  if (typeof body.hookBody === "string") {
    await setSetting(SETTING_KEYS.hookBody, body.hookBody.slice(0, 4000));
  }
  if (body.wechatMode === "optional" || body.wechatMode === "required") {
    await setSetting(SETTING_KEYS.wechatMode, body.wechatMode);
  }
  if (body.showQr === true || body.showQr === false) {
    await setSetting(SETTING_KEYS.showQr, body.showQr ? "1" : "0");
  }
  return NextResponse.json({ ok: true });
}

