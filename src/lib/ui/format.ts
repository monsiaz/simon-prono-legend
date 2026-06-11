// Formatage FR des dates/heures (fuseau de Paris) et libellés du tournoi.

import type { Phase } from "../data/calendrier";

export function jourFr(dateUtc: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(dateUtc.replace(" ", "T")));
}

export function heureFr(dateUtc: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(dateUtc.replace(" ", "T")));
}

export const LIBELLE_PHASE: Record<Phase, string> = {
  groupes: "Phase de groupes",
  "32es": "32es de finale",
  "8es": "8es de finale",
  quarts: "Quarts de finale",
  demies: "Demi-finales",
  "petite-finale": "Petite finale",
  finale: "Finale",
};

export type Confiance = "élevée" | "moyenne" | "ouverte";

export function confianceProno(probaMax: number): Confiance {
  if (probaMax >= 0.6) return "élevée";
  if (probaMax >= 0.45) return "moyenne";
  return "ouverte";
}

export const COULEUR_CONFIANCE: Record<Confiance, string> = {
  élevée: "text-volt border-volt/40",
  moyenne: "text-or border-or/40",
  ouverte: "text-brume border-ligne",
};
