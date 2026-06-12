// Libellés et couleurs du tracking des pronos, plus le score leurre affiché
// sous le flou (un faux score déterministe : personne ne devine le vrai).

import type { Verdict } from "../service/pronostics";

export const LIBELLE_VERDICT: Record<Verdict, string> = {
  exact: "Dans le mille",
  resultat: "Bon call",
  perdu: "À côté",
};

export const COULEUR_VERDICT: Record<Verdict, string> = {
  exact: "border-volt/60 bg-volt/10 text-volt",
  resultat: "border-or/60 bg-or/10 text-or",
  perdu: "border-rouge/50 bg-rouge/10 text-rouge",
};

export function scoreLeurre(numeroMatch: number): string {
  return `${((numeroMatch * 7) % 4) + 1}–${(numeroMatch * 5) % 3}`;
}
