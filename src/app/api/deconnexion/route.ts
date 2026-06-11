// POST /api/deconnexion — efface la session.

import { NextResponse } from "next/server";
import { COOKIE_SESSION, COOKIE_UI } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE_SESSION, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  reponse.cookies.set(COOKIE_UI, "", { secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return reponse;
}
