// Les 8 meilleurs troisièmes (sur 12) se qualifient pour les 32es. Chaque
// place du tableau n'accepte que certains groupes (labels du type "3ABCDF") :
// l'affectation est un couplage parfait, résolu par backtracking.

import type { LigneClassement } from "./groupes";

export interface TiersClasse extends LigneClassement {
  groupe: string;
}

export function selectionnerMeilleursTiers(tiers: TiersClasse[], elos: Map<string, number>): TiersClasse[] {
  return [...tiers]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.difference - a.difference ||
        b.butsPour - a.butsPour ||
        (elos.get(b.equipe) ?? 0) - (elos.get(a.equipe) ?? 0),
    )
    .slice(0, 8);
}

export interface PlaceTiers {
  numeroMatch: number;
  groupesAdmis: string[]; // ex. "3ABCDF" → ["A","B","C","D","F"]
}

export function parsePlaceholderTiers(placeholder: string): string[] {
  return placeholder.replace(/^3/, "").split("");
}

// Affecte chaque tiers qualifié à une place compatible (couplage parfait).
export function affecterTiers(groupesQualifies: string[], places: PlaceTiers[]): Map<number, string> | null {
  const affectation = new Map<number, string>();
  const utilises = new Set<string>();

  // Heuristique classique : traiter d'abord les places les plus contraintes.
  const ordonnees = [...places].sort(
    (a, b) =>
      a.groupesAdmis.filter((g) => groupesQualifies.includes(g)).length -
      b.groupesAdmis.filter((g) => groupesQualifies.includes(g)).length,
  );

  function chercher(index: number): boolean {
    if (index === ordonnees.length) return true;
    const place = ordonnees[index];
    for (const groupe of place.groupesAdmis) {
      if (!groupesQualifies.includes(groupe) || utilises.has(groupe)) continue;
      utilises.add(groupe);
      affectation.set(place.numeroMatch, groupe);
      if (chercher(index + 1)) return true;
      utilises.delete(groupe);
      affectation.delete(place.numeroMatch);
    }
    return false;
  }

  return chercher(0) ? affectation : null;
}
