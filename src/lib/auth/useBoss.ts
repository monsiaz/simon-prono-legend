"use client";

// Statut boss côté client : présence du cookie miroir boss_ui.
// Cosmétique uniquement (défloutage) — la vérité reste le cookie httpOnly signé.

import { useSyncExternalStore } from "react";
import { COOKIE_UI } from "./session-constantes";

function lireCookieUi(): boolean {
  return document.cookie.split("; ").some((c) => c === `${COOKIE_UI}=1`);
}

const abonnes = new Set<() => void>();

export function notifierChangementSession(): void {
  abonnes.forEach((f) => f());
}

export function useBoss(): boolean {
  return useSyncExternalStore(
    (notifier) => {
      abonnes.add(notifier);
      return () => abonnes.delete(notifier);
    },
    lireCookieUi,
    () => false, // SSR : jamais boss au premier rendu
  );
}
