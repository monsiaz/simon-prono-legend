// Rafraîchissement forcé des pronos (cron Vercel + secours manuel).
// L'ISR de 30 min couvre déjà les visites ; ce cron garantit une mise à jour
// même sans trafic. Protégé par CRON_SECRET quand il est défini.

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(requete: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret && requete.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  for (const chemin of ["/", "/groupes", "/tableau", "/cotes", "/actus"]) {
    revalidatePath(chemin);
  }
  revalidatePath("/match/[numero]", "page");
  return NextResponse.json({ ok: true, rafraichiLe: new Date().toISOString() });
}
