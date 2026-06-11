import { describe, expect, it } from "vitest";
import { mettreAJourElo, multiplicateurMarge, probaVictoireElo } from "./elo";

describe("probaVictoireElo", () => {
  it("vaut 0.5 à ratings égaux", () => {
    expect(probaVictoireElo(1800, 1800)).toBeCloseTo(0.5, 12);
  });

  it("vaut ~0.76 à +200 Elo (propriété logistique standard)", () => {
    expect(probaVictoireElo(2000, 1800)).toBeCloseTo(0.7597, 3);
  });

  it("le bonus domicile décale l'expectancy", () => {
    expect(probaVictoireElo(1800, 1800, 100)).toBeGreaterThan(0.6);
  });
});

describe("multiplicateurMarge", () => {
  it("suit le barème 1 / 1.5 / 1.75 / +0.125 par but", () => {
    expect(multiplicateurMarge(0)).toBe(1);
    expect(multiplicateurMarge(1)).toBe(1);
    expect(multiplicateurMarge(2)).toBe(1.5);
    expect(multiplicateurMarge(3)).toBe(1.75);
    expect(multiplicateurMarge(5)).toBe(2);
    expect(multiplicateurMarge(-2)).toBe(1.5);
  });
});

describe("mettreAJourElo", () => {
  it("est à somme nulle", () => {
    const { deltaA, deltaB } = mettreAJourElo(1900, 1700, 1, 50, 2);
    expect(deltaA + deltaB).toBeCloseTo(0, 12);
  });

  it("récompense plus une victoire d'outsider", () => {
    const outsider = mettreAJourElo(1700, 1900, 1, 50, 1).deltaA;
    const favori = mettreAJourElo(1900, 1700, 1, 50, 1).deltaA;
    expect(outsider).toBeGreaterThan(favori);
  });

  it("un nul entre égaux ne change rien", () => {
    expect(mettreAJourElo(1800, 1800, 0.5, 50, 0).deltaA).toBeCloseTo(0, 12);
  });
});
