import { NextResponse } from "next/server";
import { getQrImage, getWechatMode, getShowQr, getHookTitle, getHookBody } from "@/lib/settings";

// 报告页/问卷页需要的公开配置：引流文案 + 二维码图 + 微信必填模式 + 二维码显隐
export async function GET() {
  const qrImage = await getQrImage();
  const wechatMode = await getWechatMode();
  const showQr = await getShowQr();
  const hookTitle = await getHookTitle();
  const hookBody = await getHookBody();
  return NextResponse.json({
    hookTitle,
    hookBody: hookBody.split("\n").filter((l) => l.trim()), // 段落数组
    qrImage,
    wechatMode, // "optional" | "required"
    showQr, // boolean
  });
}
