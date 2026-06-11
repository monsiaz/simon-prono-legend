// Passe Elo chronologique sur tout l'historique. En plus des ratings finaux,
// on capture pour chaque match récent les ratings d'AVANT le match — c'est la
// matière première de l'ajustement des paramètres et du backtest (aucune
// information du futur ne fuit dans une prédiction).

import { mettreAJourElo, probaVictoireElo } from "../../src/lib/moteur/elo";
import { facteurK, type MatchHistorique } from "./chargement";

export const ELO_INITIAL = 1500;

export interface ObservationMatch {
  date: string;
  eloDomicile: number; // avant match
  eloExterieur: number;
  butsDomicile: number;
  butsExterieur: number;
  terrainNeutre: boolean;
  competition: string;
}

export interface ResultatPasse {
  ratings: Map<string, number>;
  observations: ObservationMatch[]; // matchs >= dateObservation
}

export function passeElo(matchs: MatchHistorique[], avantageDomicile: number, dateObservation = "2014-01-01"): ResultatPasse {
  const ratings = new Map<string, number>();
  const observations: ObservationMatch[] = [];
  const elo = (equipe: string) => ratings.get(equipe) ?? ELO_INITIAL;

  for (const m of matchs) {
    const eloDomicile = elo(m.domicile);
    const eloExterieur = elo(m.exterieur);
    if (m.date >= dateObservation) {
      observations.push({
        date: m.date,
        eloDomicile,
        eloExterieur,
        butsDomicile: m.butsDomicile,
        butsExterieur: m.butsExterieur,
        terrainNeutre: m.terrainNeutre,
        competition: m.competition,
      });
    }
    const bonus = m.terrainNeutre ? 0 : avantageDomicile;
    const scoreDomicile = m.butsDomicile > m.butsExterieur ? 1 : m.butsDomicile < m.butsExterieur ? 0 : 0.5;
    const { deltaA, deltaB } = mettreAJourElo(
      eloDomicile,
      eloExterieur,
      scoreDomicile,
      facteurK(m.competition),
      m.butsDomicile - m.butsExterieur,
      bonus,
    );
    ratings.set(m.domicile, eloDomicile + deltaA);
    ratings.set(m.exterieur, eloExterieur + deltaB);
  }
  return { ratings, observations };
}

// Score de Brier de l'expectancy Elo (nul compté 0.5) — sert à choisir
// l'avantage domicile par recherche sur grille.
export function brierExpectancy(observations: ObservationMatch[], avantageDomicile: number): number {
  let somme = 0;
  for (const o of observations) {
    const bonus = o.terrainNeutre ? 0 : avantageDomicile;
    const attendu = probaVictoireElo(o.eloDomicile, o.eloExterieur, bonus);
    const reel = o.butsDomicile > o.butsExterieur ? 1 : o.butsDomicile < o.butsExterieur ? 0 : 0.5;
    somme += (attendu - reel) ** 2;
  }
  return somme / observations.length;
}
