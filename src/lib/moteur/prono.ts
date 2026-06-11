// Choix du pronostic optimal : non pas le score le plus probable, mais celui
// qui maximise l'espérance de points selon le barème du jeu de pronostics
// (un 2-1 peut battre un 1-1 plus probable si le bon résultat rapporte gros).

import type { Scoreline } from "./scorelines";
import { topScores } from "./scorelines";

export interface Bareme {
  pointsScoreExact: number;
  pointsBonResultat: number; // bon vainqueur (ou nul) sans le score exact
}

export const BAREME_DEFAUT: Bareme = { pointsScoreExact: 3, pointsBonResultat: 1 };

export interface PronoConseille extends Scoreline {
  esperancePoints: number;
  probaBonResultat: number;
}

function issue(butsA: number, butsB: number): "A" | "N" | "B" {
  if (butsA > butsB) return "A";
  if (butsA < butsB) return "B";
  return "N";
}

export function esperancePoints(matrice: number[][], butsA: number, butsB: number, bareme: Bareme): number {
  const resultatProno = issue(butsA, butsB);
  let probaExact = 0;
  let probaResultat = 0;
  for (let a = 0; a < matrice.length; a++) {
    for (let b = 0; b < matrice[a].length; b++) {
      if (issue(a, b) !== resultatProno) continue;
      if (a === butsA && b === butsB) probaExact += matrice[a][b];
      else probaResultat += matrice[a][b];
    }
  }
  return probaExact * bareme.pointsScoreExact + probaResultat * bareme.pointsBonResultat;
}

export function pronoOptimal(matrice: number[][], bareme: Bareme = BAREME_DEFAUT, candidats = 25): PronoConseille {
  let meilleur: PronoConseille | null = null;
  for (const score of topScores(matrice, candidats)) {
    const esperance = esperancePoints(matrice, score.butsA, score.butsB, bareme);
    if (!meilleur || esperance > meilleur.esperancePoints) {
      const resultatProno = issue(score.butsA, score.butsB);
      let probaBonResultat = 0;
      for (let a = 0; a < matrice.length; a++) {
        for (let b = 0; b < matrice[a].length; b++) {
          if (issue(a, b) === resultatProno) probaBonResultat += matrice[a][b];
        }
      }
      meilleur = { ...score, esperancePoints: esperance, probaBonResultat };
    }
  }
  return meilleur!;
}
