// Modèle de scorelines : Poisson bivarié (Maher 1982) avec correction des
// petits scores (Dixon & Coles 1997). Les buts attendus suivent une régression
// de Poisson à lien log sur l'écart Elo — paramètres ajustés sur données
// réelles par scripts/calibrate-ratings.ts, jamais codés en dur.

import { pmfPoisson, tiragePoisson } from "./poisson";
import { probaVictoireElo } from "./elo";

export interface ParametresModele {
  alpha: number; // intercept de la régression log(λ)
  beta: number; // pente sur l'écart Elo normalisé
  rho: number; // correction Dixon-Coles des scores 0-0 / 1-1 / 1-0 / 0-1
  avantageDomicile: number; // bonus Elo du pays hôte
}

export const MAX_BUTS = 10;
const LAMBDA_MIN = 0.2;
const LAMBDA_MAX = 4.2;

export function butsAttendus(eloAttaque: number, eloDefense: number, parametres: ParametresModele, bonusElo = 0): number {
  const ecart = (eloAttaque + bonusElo - eloDefense) / 400;
  const lambda = Math.exp(parametres.alpha + parametres.beta * ecart);
  return Math.min(LAMBDA_MAX, Math.max(LAMBDA_MIN, lambda));
}

// Facteur correctif Dixon-Coles : le Poisson indépendant sous-estime 0-0 et 1-1.
export function correctionDixonColes(butsA: number, butsB: number, lambda: number, mu: number, rho: number): number {
  if (butsA === 0 && butsB === 0) return 1 - lambda * mu * rho;
  if (butsA === 0 && butsB === 1) return 1 + lambda * rho;
  if (butsA === 1 && butsB === 0) return 1 + mu * rho;
  if (butsA === 1 && butsB === 1) return 1 - rho;
  return 1;
}

export interface PrevisionMatch {
  matrice: number[][]; // matrice[a][b] = P(score a-b), normalisée
  probaA: number;
  probaNul: number;
  probaB: number;
  lambdaA: number;
  lambdaB: number;
}

export function prevoirMatch(eloA: number, eloB: number, parametres: ParametresModele, bonusEloA = 0): PrevisionMatch {
  const lambdaA = butsAttendus(eloA, eloB, parametres, bonusEloA);
  const lambdaB = butsAttendus(eloB, eloA, parametres, -bonusEloA);
  const matrice: number[][] = [];
  let total = 0;
  for (let a = 0; a <= MAX_BUTS; a++) {
    const ligne: number[] = [];
    const pA = pmfPoisson(a, lambdaA);
    for (let b = 0; b <= MAX_BUTS; b++) {
      const p = pA * pmfPoisson(b, lambdaB) * correctionDixonColes(a, b, lambdaA, lambdaB, parametres.rho);
      ligne.push(Math.max(0, p));
      total += Math.max(0, p);
    }
    matrice.push(ligne);
  }
  let probaA = 0;
  let probaNul = 0;
  let probaB = 0;
  for (let a = 0; a <= MAX_BUTS; a++) {
    for (let b = 0; b <= MAX_BUTS; b++) {
      matrice[a][b] /= total;
      if (a > b) probaA += matrice[a][b];
      else if (a === b) probaNul += matrice[a][b];
      else probaB += matrice[a][b];
    }
  }
  return { matrice, probaA, probaNul, probaB, lambdaA, lambdaB };
}

export interface Scoreline {
  butsA: number;
  butsB: number;
  proba: number;
}

export function topScores(matrice: number[][], nombre = 5): Scoreline[] {
  const scores: Scoreline[] = [];
  for (let a = 0; a < matrice.length; a++) {
    for (let b = 0; b < matrice[a].length; b++) {
      scores.push({ butsA: a, butsB: b, proba: matrice[a][b] });
    }
  }
  return scores.sort((x, y) => y.proba - x.proba).slice(0, nombre);
}

// Tirage d'un score pour le Monte Carlo. sansNul=true (phase finale) :
// un nul se résout aux tirs au but, départagés par l'expectancy Elo.
export function tirerScore(
  eloA: number,
  eloB: number,
  parametres: ParametresModele,
  bonusEloA = 0,
  sansNul = false,
  alea: () => number = Math.random,
): { butsA: number; butsB: number; vainqueurTab?: "A" | "B" } {
  const lambdaA = butsAttendus(eloA, eloB, parametres, bonusEloA);
  const lambdaB = butsAttendus(eloB, eloA, parametres, -bonusEloA);
  const butsA = tiragePoisson(lambdaA, alea);
  const butsB = tiragePoisson(lambdaB, alea);
  if (sansNul && butsA === butsB) {
    const vainqueurTab = alea() < probaVictoireElo(eloA, eloB, bonusEloA) ? "A" : "B";
    return { butsA, butsB, vainqueurTab };
  }
  return { butsA, butsB };
}
