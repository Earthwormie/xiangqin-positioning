import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET || "xq-positioning-secret-please-change";
const USER_COOKIE = "xq_unlocked";
const ADMIN_COOKIE = "xq_admin";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function makeToken(scope: string): string {
  const payload = `${scope}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined, scope: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [s, ts, sig] = parts;
  if (s !== scope) return false;
  const expect = sign(`${s}.${ts}`);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

// —— 用户端：通过测评密码 ——
export async function setUserUnlocked() {
  const c = await cookies();
  c.set(USER_COOKIE, makeToken("user"), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function isUserUnlocked(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(USER_COOKIE)?.value, "user");
}

// —— 后台：管理员密码 ——
export async function setAdminAuth() {
  const c = await cookies();
  c.set(ADMIN_COOKIE, makeToken("admin"), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
}
export async function isAdminAuthed(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(ADMIN_COOKIE)?.value, "admin");
}
export async function clearAdminAuth() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}
