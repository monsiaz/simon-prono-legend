// Libellés et couleurs du tracking des pronos.

import type { Verdict } from "../service/pronostics";

export const LIBELLE_VERDICT: Record<Verdict, string> = {
  exact: "Score exact",
  resultat: "Pari gagné",
  perdu: "Pari perdu",
};

export const COULEUR_VERDICT: Record<Verdict, string> = {
  exact: "border-volt/60 text-volt",
  resultat: "border-or/60 text-or",
  perdu: "border-rouge/50 text-rouge",
};
