import { describe, expect, it } from "vitest";
import snapshot from "../../data/calendrier-snapshot.json";
import ratingsJson from "../../data/ratings.json";
import { normaliserCalendrier } from "../data/calendrier";
import { equipeDepuisNomFifa } from "../data/equipes";
import { simulerTournoi, type MatchSim } from "./tournoi";

const PARAMS = ratingsJson.parametres;

function matchsDepuisSnapshot(): MatchSim[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return normaliserCalendrier(snapshot as any).map((m) => ({
    numero: m.numero,
    phase: m.phase,
    groupe: m.groupe,
    domicile: m.domicile ? equipeDepuisNomFifa(m.domicile).clef : null,
    exterieur: m.exterieur ? equipeDepuisNomFifa(m.exterieur).clef : null,
    placeholderDomicile: m.placeholderDomicile,
    placeholderExterieur: m.placeholderExterieur,
    butsDomicile: m.butsDomicile,
    butsExterieur: m.butsExterieur,
    joue: m.joue,
    vainqueur: null,
    bonusEloNet: 0,
  }));
}

const ELOS = new Map(Object.entries(ratingsJson.ratings as Record<string, number>));

describe("simulerTournoi (calendrier réel 2026)", () => {
  const resultat = simulerTournoi(matchsDepuisSnapshot(), ELOS, PARAMS, 2000, 42);

  it("produit des probabilités de titre qui somment à 1", () => {
    const somme = resultat.probas.reduce((acc, p) => acc + p.titre, 0);
    expect(somme).toBeCloseTo(1, 6);
  });

  it("32 qualifiés des groupes par simulation en moyenne", () => {
    const somme = resultat.probas.reduce((acc, p) => acc + p.sortieGroupes, 0);
    expect(somme).toBeCloseTo(32, 6);
  });

  it("probabilités décroissantes au fil des tours pour chaque équipe", () => {
    for (const p of resultat.probas) {
      expect(p.sortieGroupes).toBeGreaterThanOrEqual(p.huitiemes);
      expect(p.huitiemes).toBeGreaterThanOrEqual(p.quarts);
      expect(p.quarts).toBeGreaterThanOrEqual(p.demies);
      expect(p.demies).toBeGreaterThanOrEqual(p.finale);
      expect(p.finale).toBeGreaterThanOrEqual(p.titre);
    }
  });

  it("le favori au titre est un grand d'Europe ou d'Amérique du Sud", () => {
    expect(["spain", "france", "argentina", "england", "brazil"]).toContain(resultat.probas[0].clef);
  });

  it("est reproductible à graine fixée", () => {
    const bis = simulerTournoi(matchsDepuisSnapshot(), ELOS, PARAMS, 500, 7);
    const ter = simulerTournoi(matchsDepuisSnapshot(), ELOS, PARAMS, 500, 7);
    expect(bis.probas).toEqual(ter.probas);
  });

  it("verrouille un résultat réel : vainqueur forcé qualifié à 100%", () => {
    const matchs = matchsDepuisSnapshot();
    // On force tous les matchs du groupe A : le Mexique gagne tout 1-0.
    for (const m of matchs) {
      if (m.groupe === "A" && (m.domicile === "mexico" || m.exterieur === "mexico")) {
        m.joue = true;
        m.butsDomicile = m.domicile === "mexico" ? 1 : 0;
        m.butsExterieur = m.domicile === "mexico" ? 0 : 1;
      }
    }
    const force = simulerTournoi(matchs, ELOS, PARAMS, 300, 11);
    const mexique = force.probas.find((p) => p.clef === "mexico")!;
    expect(mexique.sortieGroupes).toBe(1);
  });
});
