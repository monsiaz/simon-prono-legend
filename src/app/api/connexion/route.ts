// POST /api/connexion — vérifie les identifiants, pose la session.

import { NextResponse } from "next/server";
import {
  COOKIE_SESSION,
  COOKIE_UI,
  creerJetonSession,
  DUREE_SESSION_S,
  verifierIdentifiants,
} from "@/lib/auth/session";

export const runtime = "nodejs";

// Anti-rafale minimal (par instance) : 10 tentatives / 10 min / IP.
const tentatives = new Map<string, { compte: number; depuis: number }>();
const FENETRE_MS = 10 * 60 * 1000;
const MAX_TENTATIVES = 10;

function rafaleDepassee(ip: string): boolean {
  const maintenant = Date.now();
  const entree = tentatives.get(ip);
  if (!entree || maintenant - entree.depuis > FENETRE_MS) {
    tentatives.set(ip, { compte: 1, depuis: maintenant });
    return false;
  }
  entree.compte++;
  return entree.compte > MAX_TENTATIVES;
}

export async function POST(requete: Request): Promise<NextResponse> {
  const ip = requete.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
  if (rafaleDepassee(ip)) {
    return NextResponse.json({ erreur: "Trop de tentatives, réessaie dans quelques minutes." }, { status: 429 });
  }

  let email = "";
  let motDePasse = "";
  try {
    const corps = (await requete.json()) as { email?: unknown; motDePasse?: unknown };
    email = typeof corps.email === "string" ? corps.email.slice(0, 200) : "";
    motDePasse = typeof corps.motDePasse === "string" ? corps.motDePasse.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  if (!(await verifierIdentifiants(email, motDePasse))) {
    return NextResponse.json({ erreur: "Identifiants invalides." }, { status: 401 });
  }

  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE_SESSION, creerJetonSession(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION_S,
  });
  reponse.cookies.set(COOKIE_UI, "1", {
    httpOnly: false, // lu par le client pour le défloutage (cosmétique uniquement)
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION_S,
  });
  return reponse;
}
