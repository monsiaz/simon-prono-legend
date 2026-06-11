import { describe, expect, it } from "vitest";
import { affecterTiers, parsePlaceholderTiers, selectionnerMeilleursTiers, type TiersClasse } from "./meilleurs-tiers";

function tiers(groupe: string, points: number, difference = 0): TiersClasse {
  return { equipe: `tiers-${groupe}`, groupe, joues: 3, points, difference, butsPour: 3, butsContre: 3 - difference };
}

describe("selectionnerMeilleursTiers", () => {
  it("garde les 8 meilleurs sur 12", () => {
    const tous = "ABCDEFGHIJKL".split("").map((g, i) => tiers(g, i >= 4 ? 4 : 3, i));
    const retenus = selectionnerMeilleursTiers(tous, new Map());
    expect(retenus).toHaveLength(8);
    expect(retenus.every((t) => t.points === 4)).toBe(true);
  });
});

describe("parsePlaceholderTiers", () => {
  it("extrait les groupes admis du label", () => {
    expect(parsePlaceholderTiers("3ABCDF")).toEqual(["A", "B", "C", "D", "F"]);
  });
});

describe("affecterTiers", () => {
  // Les 8 vraies places du tableau 2026 (labels du feed officiel, vérifiés).
  const PLACES = [
    { numeroMatch: 74, groupesAdmis: parsePlaceholderTiers("3ABCDF") },
    { numeroMatch: 77, groupesAdmis: parsePlaceholderTiers("3CDFGH") },
    { numeroMatch: 79, groupesAdmis: parsePlaceholderTiers("3CEFHI") },
    { numeroMatch: 80, groupesAdmis: parsePlaceholderTiers("3EHIJK") },
    { numeroMatch: 81, groupesAdmis: parsePlaceholderTiers("3BEFIJ") },
    { numeroMatch: 82, groupesAdmis: parsePlaceholderTiers("3AEHIJ") },
    { numeroMatch: 85, groupesAdmis: parsePlaceholderTiers("3EFGIJ") },
    { numeroMatch: 87, groupesAdmis: parsePlaceholderTiers("3DEIJL") },
  ];

  it("trouve un couplage parfait pour une combinaison réalisable", () => {
    const affectation = affecterTiers(["A", "B", "C", "D", "E", "F", "G", "H"], PLACES);
    expect(affectation).not.toBeNull();
    expect(new Set(affectation!.values()).size).toBe(8);
    for (const place of PLACES) {
      expect(place.groupesAdmis).toContain(affectation!.get(place.numeroMatch));
    }
  });

  it("réussit pour 30 combinaisons aléatoires de 8 groupes sur 12", () => {
    const groupes = "ABCDEFGHIJKL".split("");
    let graine = 7;
    const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    for (let essai = 0; essai < 30; essai++) {
      const melange = [...groupes].sort(() => alea() - 0.5).slice(0, 8);
      const affectation = affecterTiers(melange, PLACES);
      expect(affectation, `combinaison ${melange.join("")}`).not.toBeNull();
    }
  });
});
