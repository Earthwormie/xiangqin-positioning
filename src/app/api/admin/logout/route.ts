import { NextResponse } from "next/server";
import { clearAdminAuth } from "@/lib/auth";

export async function GET(req: Request) {
  await clearAdminAuth();
  return NextResponse.redirect(new URL("/admin", req.url));
}
