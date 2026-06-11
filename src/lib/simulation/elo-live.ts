// Le modèle vit pendant le tournoi : chaque match joué met à jour les ratings
// (K=60, pondéré par la marge), avant toute nouvelle prédiction.

import { mettreAJourElo } from "../moteur/elo";

export interface MatchJoue {
  domicile: string; // clef
  exterieur: string;
  butsDomicile: number;
  butsExterieur: number;
  bonusEloNet: number;
}

const K_COUPE_DU_MONDE = 60;

export function appliquerResultats(elos: Map<string, number>, matchsJoues: MatchJoue[]): Map<string, number> {
  const resultat = new Map(elos);
  for (const m of matchsJoues) {
    const eloDomicile = resultat.get(m.domicile) ?? 1500;
    const eloExterieur = resultat.get(m.exterieur) ?? 1500;
    const score = m.butsDomicile > m.butsExterieur ? 1 : m.butsDomicile < m.butsExterieur ? 0 : 0.5;
    const { deltaA, deltaB } = mettreAJourElo(
      eloDomicile,
      eloExterieur,
      score,
      K_COUPE_DU_MONDE,
      m.butsDomicile - m.butsExterieur,
      m.bonusEloNet,
    );
    resultat.set(m.domicile, eloDomicile + deltaA);
    resultat.set(m.exterieur, eloExterieur + deltaB);
  }
  return resultat;
}
