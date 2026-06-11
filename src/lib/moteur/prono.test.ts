import { describe, expect, it } from "vitest";
import { esperancePoints, pronoOptimal } from "./prono";
import { prevoirMatch, type ParametresModele, topScores } from "./scorelines";

const PARAMS: ParametresModele = { alpha: 0.25, beta: 0.9, rho: -0.1, avantageDomicile: 60 };

describe("esperancePoints", () => {
  it("sépare proba du score exact et proba du bon résultat", () => {
    const { matrice } = prevoirMatch(1900, 1800, PARAMS);
    // Barème "tout ou rien" : seule la proba exacte compte.
    const evExactSeul = esperancePoints(matrice, 1, 0, { pointsScoreExact: 1, pointsBonResultat: 0 });
    expect(evExactSeul).toBeCloseTo(matrice[1][0], 9);
    // Barème "résultat seul" : proba de victoire de A hors 1-0.
    const evResultatSeul = esperancePoints(matrice, 1, 0, { pointsScoreExact: 0, pointsBonResultat: 1 });
    let probaVictoireA = 0;
    for (let a = 0; a < matrice.length; a++)
      for (let b = 0; b < a; b++) probaVictoireA += matrice[a][b];
    expect(evExactSeul + evResultatSeul).toBeCloseTo(probaVictoireA, 9);
  });
});

describe("pronoOptimal", () => {
  it("avec un barème écrasant le score exact, choisit le score le plus probable", () => {
    const { matrice } = prevoirMatch(1950, 1750, PARAMS);
    const prono = pronoOptimal(matrice, { pointsScoreExact: 100, pointsBonResultat: 0 });
    const [plusProbable] = topScores(matrice, 1);
    expect(prono.butsA).toBe(plusProbable.butsA);
    expect(prono.butsB).toBe(plusProbable.butsB);
  });

  it("avec un barème favorisant le résultat, peut dévier du score le plus probable", () => {
    // Match très serré : le nul 1-1 est souvent le score le plus probable,
    // mais si le bon résultat paie beaucoup, parier sur le camp le plus
    // probable (victoire) peut dominer.
    const { matrice, probaA, probaNul } = prevoirMatch(1900, 1860, PARAMS);
    const prono = pronoOptimal(matrice, { pointsScoreExact: 1, pointsBonResultat: 10 });
    if (probaA > probaNul) {
      expect(prono.butsA).toBeGreaterThan(prono.butsB);
    }
    expect(prono.esperancePoints).toBeGreaterThan(0);
    expect(prono.probaBonResultat).toBeGreaterThan(0);
    expect(prono.probaBonResultat).toBeLessThan(1);
  });
});
