import { describe, expect, it } from "vitest";
import { bonusHote, jugerProno } from "./pronostics";

describe("jugerProno", () => {
  it("score exact", () => {
    expect(jugerProno({ butsA: 2, butsB: 0 }, 2, 0)).toBe("exact");
  });

  it("bon résultat sans le score (victoire et nul)", () => {
    expect(jugerProno({ butsA: 2, butsB: 0 }, 3, 1)).toBe("resultat");
    expect(jugerProno({ butsA: 1, butsB: 1 }, 0, 0)).toBe("resultat");
  });

  it("perdu (mauvais camp ou nul raté)", () => {
    expect(jugerProno({ butsA: 2, butsB: 0 }, 0, 1)).toBe("perdu");
    expect(jugerProno({ butsA: 1, butsB: 1 }, 2, 1)).toBe("perdu");
    expect(jugerProno({ butsA: 0, butsB: 2 }, 1, 1)).toBe("perdu");
  });
});

describe("bonusHote", () => {
  it("bonus au pays hôte chez lui, dans le bon sens", () => {
    expect(bonusHote("Mexico City Stadium", "mexico", "south-africa")).toBeGreaterThan(0);
    expect(bonusHote("Toronto Stadium", "qatar", "canada")).toBeLessThan(0);
  });

  it("aucun bonus pour un hôte hors de chez lui ou un non-hôte", () => {
    expect(bonusHote("Boston Stadium", "mexico", "france")).toBe(0);
    expect(bonusHote("Dallas Stadium", "france", "brazil")).toBe(0);
  });

  it("stades américains par défaut", () => {
    expect(bonusHote("Atlanta Stadium", "united-states", "iran")).toBeGreaterThan(0);
  });
});
