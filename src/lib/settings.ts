import { prisma } from "./db";
import { DEFAULTS, SETTING_KEYS } from "./config";

// 读取单个配置，缺省回落到默认值
export async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getUserPassword() {
  return getSetting(SETTING_KEYS.userPassword, DEFAULTS.userPassword);
}
export async function getAdminPassword() {
  return getSetting(SETTING_KEYS.adminPassword, DEFAULTS.adminPassword);
}
export async function getHookTitle() {
  return getSetting(SETTING_KEYS.hookTitle, DEFAULTS.hookTitle);
}
export async function getHookBody() {
  return getSetting(SETTING_KEYS.hookBody, DEFAULTS.hookBody);
}
export async function getQrImage() {
  return getSetting(SETTING_KEYS.qrImage, DEFAULTS.qrImage);
}
export async function getWechatMode() {
  return getSetting(SETTING_KEYS.wechatMode, DEFAULTS.wechatMode);
}
export async function getShowQr() {
  return (await getSetting(SETTING_KEYS.showQr, DEFAULTS.showQr)) === "1";
}

// 生成唯一 4 位报告编号
export async function genReportCode(): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const exists = await prisma.submission.findUnique({ where: { code } });
    if (!exists) return code;
  }
  // 极端碰撞时退化为 5 位
  return String(Math.floor(10000 + Math.random() * 90000));
}
