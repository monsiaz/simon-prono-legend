import { describe, expect, it } from "vitest";
import { vainqueurReel } from "./calendrier";

describe("vainqueurReel", () => {
  it("garde un vrai vainqueur (départage tirs au but)", () => {
    expect(vainqueurReel("Argentina")).toBe("Argentina");
  });

  it("ignore Draw (match nul, pas une équipe)", () => {
    expect(vainqueurReel("Draw")).toBeNull();
    expect(vainqueurReel("draw")).toBeNull();
  });

  it("ignore vide / espaces / absent", () => {
    expect(vainqueurReel("")).toBeNull();
    expect(vainqueurReel("   ")).toBeNull();
    expect(vainqueurReel(null)).toBeNull();
    expect(vainqueurReel(undefined)).toBeNull();
  });

  it("trim le nom conservé", () => {
    expect(vainqueurReel("  Brazil  ")).toBe("Brazil");
  });
});
