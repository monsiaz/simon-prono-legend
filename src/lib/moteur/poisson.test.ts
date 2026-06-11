import { describe, expect, it } from "vitest";
import { pmfPoisson, tiragePoisson } from "./poisson";
import { creerAlea } from "./alea";

describe("pmfPoisson", () => {
  it("somme à ~1 sur un support large", () => {
    let somme = 0;
    for (let k = 0; k <= 30; k++) somme += pmfPoisson(k, 1.5);
    expect(somme).toBeCloseTo(1, 9);
  });

  it("vaut e^-λ en k=0", () => {
    expect(pmfPoisson(0, 2)).toBeCloseTo(Math.exp(-2), 12);
  });

  it("gère λ=0 (masse en 0)", () => {
    expect(pmfPoisson(0, 0)).toBe(1);
    expect(pmfPoisson(3, 0)).toBe(0);
  });
});

describe("tiragePoisson", () => {
  it("a une moyenne empirique proche de λ", () => {
    const alea = creerAlea(42);
    const n = 20000;
    let somme = 0;
    for (let i = 0; i < n; i++) somme += tiragePoisson(1.4, alea);
    expect(somme / n).toBeGreaterThan(1.3);
    expect(somme / n).toBeLessThan(1.5);
  });

  it("est reproductible à graine fixée", () => {
    const a = Array.from({ length: 10 }, () => tiragePoisson(2, creerAlea(7)));
    const b = Array.from({ length: 10 }, () => tiragePoisson(2, creerAlea(7)));
    expect(a).toEqual(b);
  });
});
