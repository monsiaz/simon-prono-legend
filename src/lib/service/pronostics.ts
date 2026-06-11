// Couche d'assemblage : calendrier + référentiel + moteur + simulation.
// Tout est recalculé côté serveur à chaque revalidation ISR (30 min).

import { cache } from "react";
import { chargerCalendrier, type MatchCalendrier } from "../data/calendrier";
import { equipeDepuisNomFifa, HOTES, PARAMETRES_CALIBRES, type Equipe } from "../data/equipes";
import { BAREME_DEFAUT, pronoOptimal, type PronoConseille } from "../moteur/prono";
import { prevoirMatch, topScores, type PrevisionMatch, type Scoreline } from "../moteur/scorelines";
import { appliquerResultats } from "../simulation/elo-live";
import { simulerTournoi, type MatchSim, type ResultatSimulation } from "../simulation/tournoi";
import ratingsJson from "@/data/ratings.json";

export interface MatchEnrichi {
  calendrier: MatchCalendrier;
  domicile: Equipe | null;
  exterieur: Equipe | null;
  prevision: PrevisionMatch | null; // null tant que l'affiche n'est pas connue
  scoresProbables: Scoreline[];
  prono: PronoConseille | null;
}

// Bonus Elo net (côté domicile) quand un pays hôte joue sur son sol.
export function bonusHote(stade: string, clefDomicile: string | null, clefExterieur: string | null): number {
  const ville = stade.toLowerCase();
  let pays = "united-states";
  if (/mexico city|guadalajara|monterrey/.test(ville)) pays = "mexico";
  else if (/toronto|vancouver/.test(ville)) pays = "canada";
  const avantage = PARAMETRES_CALIBRES.avantageDomicile;
  if (clefDomicile && HOTES.has(clefDomicile) && clefDomicile === pays) return avantage;
  if (clefExterieur && HOTES.has(clefExterieur) && clefExterieur === pays) return -avantage;
  return 0;
}

function versEquipe(nomFifa: string | null): Equipe | null {
  return nomFifa ? equipeDepuisNomFifa(nomFifa) : null;
}

function versMatchSim(m: MatchCalendrier, domicile: Equipe | null, exterieur: Equipe | null): MatchSim {
  return {
    numero: m.numero,
    phase: m.phase,
    groupe: m.groupe,
    domicile: domicile?.clef ?? null,
    exterieur: exterieur?.clef ?? null,
    placeholderDomicile: m.placeholderDomicile,
    placeholderExterieur: m.placeholderExterieur,
    butsDomicile: m.butsDomicile,
    butsExterieur: m.butsExterieur,
    joue: m.joue,
    vainqueur: m.vainqueur ? equipeDepuisNomFifa(m.vainqueur).clef : null,
    bonusEloNet: bonusHote(m.stade, domicile?.clef ?? null, exterieur?.clef ?? null),
  };
}

export interface DonneesPronostics {
  matchs: MatchEnrichi[];
  simulation: ResultatSimulation;
  elosLive: Map<string, number>;
  genereLe: string;
}

export const chargerPronostics = cache(async (): Promise<DonneesPronostics> => {
  const calendrier = await chargerCalendrier();
  const parametres = PARAMETRES_CALIBRES;

  const bruts = calendrier.map((m) => {
    const domicile = versEquipe(m.domicile);
    const exterieur = versEquipe(m.exterieur);
    return { m, domicile, exterieur, sim: versMatchSim(m, domicile, exterieur) };
  });

  // Ratings vivants : calibration + matchs du Mondial déjà joués.
  const elosCalibres = new Map(Object.entries(ratingsJson.ratings as Record<string, number>));
  const joues = bruts.filter((b) => b.sim.joue && b.sim.domicile && b.sim.exterieur);
  const elosLive = appliquerResultats(
    elosCalibres,
    joues.map((b) => ({
      domicile: b.sim.domicile!,
      exterieur: b.sim.exterieur!,
      butsDomicile: b.sim.butsDomicile!,
      butsExterieur: b.sim.butsExterieur!,
      bonusEloNet: b.sim.bonusEloNet,
    })),
  );
  const elo = (clef: string) => elosLive.get(clef) ?? 1500;

  const matchs: MatchEnrichi[] = bruts.map(({ m, domicile, exterieur, sim }) => {
    if (!domicile || !exterieur) {
      return { calendrier: m, domicile, exterieur, prevision: null, scoresProbables: [], prono: null };
    }
    const prevision = prevoirMatch(elo(domicile.clef), elo(exterieur.clef), parametres, sim.bonusEloNet);
    return {
      calendrier: m,
      domicile,
      exterieur,
      prevision,
      scoresProbables: topScores(prevision.matrice, 5),
      prono: pronoOptimal(prevision.matrice, BAREME_DEFAUT),
    };
  });

  const simulation = simulerTournoi(
    bruts.map((b) => b.sim),
    elosLive,
    parametres,
  );

  return { matchs, simulation, elosLive, genereLe: new Date().toISOString() };
});
