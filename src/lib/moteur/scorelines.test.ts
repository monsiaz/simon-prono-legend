import { describe, expect, it } from "vitest";
import { creerAlea } from "./alea";
import {
  butsAttendus,
  correctionDixonColes,
  type ParametresModele,
  prevoirMatch,
  tirerScore,
  topScores,
} from "./scorelines";

const PARAMS: ParametresModele = { alpha: 0.25, beta: 0.9, rho: -0.1, avantageDomicile: 60 };

describe("butsAttendus", () => {
  it("croît avec l'écart Elo et reste borné", () => {
    const faible = butsAttendus(1500, 2000, PARAMS);
    const fort = butsAttendus(2000, 1500, PARAMS);
    expect(fort).toBeGreaterThan(faible);
    expect(faible).toBeGreaterThanOrEqual(0.2);
    expect(fort).toBeLessThanOrEqual(4.2);
  });

  it("est symétrique à ratings égaux sans bonus", () => {
    expect(butsAttendus(1800, 1800, PARAMS)).toBeCloseTo(Math.exp(PARAMS.alpha), 9);
  });
});

describe("correctionDixonColes", () => {
  it("avec ρ négatif, gonfle 0-0 et 1-1, dégonfle 1-0 et 0-1", () => {
    expect(correctionDixonColes(0, 0, 1.3, 1.1, -0.1)).toBeGreaterThan(1);
    expect(correctionDixonColes(1, 1, 1.3, 1.1, -0.1)).toBeGreaterThan(1);
    expect(correctionDixonColes(1, 0, 1.3, 1.1, -0.1)).toBeLessThan(1);
    expect(correctionDixonColes(0, 1, 1.3, 1.1, -0.1)).toBeLessThan(1);
    expect(correctionDixonColes(2, 1, 1.3, 1.1, -0.1)).toBe(1);
  });
});

describe("prevoirMatch", () => {
  it("produit des probabilités 1X2 qui somment à 1", () => {
    const p = prevoirMatch(1950, 1820, PARAMS);
    expect(p.probaA + p.probaNul + p.probaB).toBeCloseTo(1, 9);
  });

  it("la matrice somme à 1", () => {
    const p = prevoirMatch(1950, 1820, PARAMS);
    const somme = p.matrice.flat().reduce((acc, x) => acc + x, 0);
    expect(somme).toBeCloseTo(1, 9);
  });

  it("favorise la meilleure équipe", () => {
    const p = prevoirMatch(2000, 1700, PARAMS);
    expect(p.probaA).toBeGreaterThan(p.probaB);
    expect(p.probaA).toBeGreaterThan(0.5);
  });

  it("match serré : le score le plus probable est un petit score", () => {
    const p = prevoirMatch(1850, 1850, PARAMS);
    const [meilleur] = topScores(p.matrice, 1);
    expect(meilleur.butsA + meilleur.butsB).toBeLessThanOrEqual(2);
  });
});

describe("topScores", () => {
  it("retourne les n scores triés par probabilité décroissante", () => {
    const p = prevoirMatch(1900, 1800, PARAMS);
    const scores = topScores(p.matrice, 5);
    expect(scores).toHaveLength(5);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i].proba).toBeLessThanOrEqual(scores[i - 1].proba);
    }
  });
});

describe("tirerScore", () => {
  it("sansNul résout les égalités aux tirs au but", () => {
    const alea = creerAlea(123);
    for (let i = 0; i < 200; i++) {
      const t = tirerScore(1800, 1800, PARAMS, 0, true, alea);
      if (t.butsA === t.butsB) expect(t.vainqueurTab).toBeDefined();
      else expect(t.vainqueurTab).toBeUndefined();
    }
  });

  it("fréquences empiriques cohérentes avec les probabilités théoriques", () => {
    const alea = creerAlea(99);
    const p = prevoirMatch(2000, 1700, PARAMS);
    let victoiresA = 0;
    const n = 10000;
    for (let i = 0; i < n; i++) {
      const t = tirerScore(2000, 1700, PARAMS, 0, false, alea);
      if (t.butsA > t.butsB) victoiresA++;
    }
    expect(victoiresA / n).toBeGreaterThan(p.probaA - 0.03);
    expect(victoiresA / n).toBeLessThan(p.probaA + 0.03);
  });
});
