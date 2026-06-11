// Backtest honnête : les paramètres sont ajustés sur une fenêtre ANTÉRIEURE
// à la fenêtre d'évaluation, et chaque prédiction n'utilise que les ratings
// d'avant le match (walk-forward, out-of-sample).

import { prevoirMatch, type ParametresModele } from "../../src/lib/moteur/scorelines";
import type { ObservationMatch } from "./passe-elo";

export interface ScoresBacktest {
  matchsEvalues: number;
  logLoss: number; // 1X2, ↓ mieux — coin-flip ≈ 1.10
  rps: number; // Ranked Probability Score, ↓ mieux — coin-flip ≈ 0.24
  exactitude: number; // part de bons résultats 1X2
  logLossUniforme: number;
}

export function backtester(observations: ObservationMatch[], parametres: ParametresModele): ScoresBacktest {
  let logLoss = 0;
  let rps = 0;
  let corrects = 0;
  let n = 0;
  for (const o of observations) {
    const bonus = o.terrainNeutre ? 0 : parametres.avantageDomicile;
    const p = prevoirMatch(o.eloDomicile, o.eloExterieur, parametres, bonus);
    const issueReelle = o.butsDomicile > o.butsExterieur ? 0 : o.butsDomicile === o.butsExterieur ? 1 : 2;
    const probas = [p.probaA, p.probaNul, p.probaB];
    logLoss += -Math.log(Math.max(1e-12, probas[issueReelle]));
    // RPS : somme des carrés des écarts de probabilités cumulées.
    const cumulPrevu = [probas[0], probas[0] + probas[1]];
    const cumulReel = [issueReelle === 0 ? 1 : 0, issueReelle <= 1 ? 1 : 0];
    rps += 0.5 * ((cumulPrevu[0] - cumulReel[0]) ** 2 + (cumulPrevu[1] - cumulReel[1]) ** 2);
    if (probas.indexOf(Math.max(...probas)) === issueReelle) corrects++;
    n++;
  }
  return {
    matchsEvalues: n,
    logLoss: logLoss / n,
    rps: rps / n,
    exactitude: corrects / n,
    logLossUniforme: -Math.log(1 / 3),
  };
}
