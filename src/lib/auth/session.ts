// Session « boss » — un seul compte, vérifié côté serveur.
// Le mot de passe n'existe nulle part en clair : hash bcrypt en variable
// d'environnement. Le jeton de session est signé HMAC-SHA256 (stateless).

import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export const COOKIE_SESSION = "boss_session";
export { COOKIE_UI } from "./session-constantes"; // miroir non-httpOnly, purement cosmétique (défloutage)
export const DUREE_SESSION_S = 30 * 24 * 3600;

// Mot de passe dicté à la voix : on tolère espaces et majuscules.
export function normaliserMotDePasse(motDePasse: string): string {
  return motDePasse.toLowerCase().replace(/\s+/g, "");
}

export async function verifierIdentifiants(email: string, motDePasse: string): Promise<boolean> {
  const emailAttendu = process.env.BOSS_EMAIL;
  // Hash bcrypt stocké en base64 : ses « $ » cassent l'expansion dotenv sinon.
  const hashAttendu = process.env.BOSS_PASSWORD_HASH_B64
    ? Buffer.from(process.env.BOSS_PASSWORD_HASH_B64, "base64").toString("utf8")
    : undefined;
  if (!emailAttendu || !hashAttendu) return false;
  const emailOk = email.trim().toLowerCase() === emailAttendu.toLowerCase();
  // bcrypt.compare toujours exécuté (pas de court-circuit énumérant sur l'email).
  const motDePasseOk = await bcrypt.compare(normaliserMotDePasse(motDePasse), hashAttendu);
  return emailOk && motDePasseOk;
}

function signer(charge: string, secret: string): string {
  return createHmac("sha256", secret).update(charge).digest("hex");
}

export function creerJetonSession(maintenantMs = Date.now()): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant");
  const charge = `boss:${maintenantMs + DUREE_SESSION_S * 1000}`;
  return `${charge}.${signer(charge, secret)}`;
}

export function verifierJetonSession(jeton: string | undefined, maintenantMs = Date.now()): boolean {
  const secret = process.env.SESSION_SECRET;
  if (!jeton || !secret) return false;
  const separateur = jeton.lastIndexOf(".");
  if (separateur < 0) return false;
  const charge = jeton.slice(0, separateur);
  const signature = jeton.slice(separateur + 1);
  const attendue = signer(charge, secret);
  if (signature.length !== attendue.length) return false;
  if (!timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(attendue, "utf8"))) return false;
  const [prefixe, expiration] = charge.split(":");
  return prefixe === "boss" && Number(expiration) > maintenantMs;
}
