import { describe, expect, it } from "vitest";
import { classerGroupe, type MatchGroupe } from "./groupes";

const ELOS = new Map([
  ["alpha", 1900],
  ["beta", 1800],
  ["gamma", 1700],
  ["delta", 1600],
]);

describe("classerGroupe", () => {
  it("classe par points puis différence puis buts marqués", () => {
    const matchs: MatchGroupe[] = [
      { domicile: "alpha", exterieur: "beta", butsDomicile: 2, butsExterieur: 0 },
      { domicile: "gamma", exterieur: "delta", butsDomicile: 1, butsExterieur: 1 },
      { domicile: "alpha", exterieur: "gamma", butsDomicile: 1, butsExterieur: 0 },
      { domicile: "beta", exterieur: "delta", butsDomicile: 3, butsExterieur: 0 },
    ];
    const classement = classerGroupe(["alpha", "beta", "gamma", "delta"], matchs, ELOS);
    expect(classement.map((l) => l.equipe)).toEqual(["alpha", "beta", "gamma", "delta"]);
    expect(classement[0].points).toBe(6);
    expect(classement[1].difference).toBe(1);
  });

  it("départage les ex æquo stricts par confrontation directe", () => {
    // alpha et beta : mêmes points (4), même différence (+1), mêmes buts (3)…
    const matchs: MatchGroupe[] = [
      { domicile: "alpha", exterieur: "beta", butsDomicile: 0, butsExterieur: 1 },
      { domicile: "alpha", exterieur: "gamma", butsDomicile: 2, butsExterieur: 1 },
      { domicile: "beta", exterieur: "delta", butsDomicile: 1, butsExterieur: 0 },
      { domicile: "alpha", exterieur: "delta", butsDomicile: 1, butsExterieur: 0 },
      { domicile: "beta", exterieur: "gamma", butsDomicile: 1, butsExterieur: 1 },
    ];
    const classement = classerGroupe(["alpha", "beta", "gamma", "delta"], matchs, ELOS);
    // …mais beta a battu alpha en confrontation directe.
    expect(classement[0].equipe).toBe("beta");
    expect(classement[1].equipe).toBe("alpha");
  });

  it("sans aucun match, retombe sur un classement complet (4 lignes)", () => {
    const classement = classerGroupe(["alpha", "beta", "gamma", "delta"], [], ELOS);
    expect(classement).toHaveLength(4);
  });
});
