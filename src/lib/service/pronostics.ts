// Couche d'assemblage : calendrier + référentiel + moteur + simulation.
// Les matchs sont parcourus dans l'ordre du calendrier : chaque prono est
// calculé avec les ratings d'AVANT le match (le prono d'un match joué reste
// donc celui qu'on affichait avant le coup d'envoi), puis le résultat réel
// met à jour les ratings. Tout est recalculé à chaque revalidation ISR.

import { cache } from "react";
import { chargerCalendrier, type MatchCalendrier } from "../data/calendrier";
import { equipeDepuisNomFifa, HOTES, PARAMETRES_CALIBRES, type Equipe } from "../data/equipes";
import { mettreAJourElo } from "../moteur/elo";
import { BAREME_DEFAUT, pronoOptimal, type PronoConseille } from "../moteur/prono";
import { prevoirMatch, topScores, type PrevisionMatch, type Scoreline } from "../moteur/scorelines";
import { simulerTournoi, type MatchSim, type ResultatSimulation } from "../simulation/tournoi";
import ratingsJson from "@/data/ratings.json";

export type Verdict = "exact" | "resultat" | "perdu";

export interface MatchEnrichi {
  calendrier: MatchCalendrier;
  domicile: Equipe | null;
  exterieur: Equipe | null;
  prevision: PrevisionMatch | null; // figée pré-match si le match est joué
  scoresProbables: Scoreline[];
  prono: PronoConseille | null;
  verdict: Verdict | null; // rempli dès que le match est joué
}

export interface TrackingPronos {
  joues: number;
  exacts: number;
  bonsResultats: number; // bon 1·N·2 sans le score exact
  perdus: number;
  points: number; // barème 3 pts exact / 1 pt bon résultat
}

export interface DonneesPronostics {
  matchs: MatchEnrichi[];
  simulation: ResultatSimulation;
  elosLive: Map<string, number>;
  tracking: TrackingPronos;
  genereLe: string;
}

const K_COUPE_DU_MONDE = 60;

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

export function jugerProno(prono: Pick<PronoConseille, "butsA" | "butsB">, butsDomicile: number, butsExterieur: number): Verdict {
  if (prono.butsA === butsDomicile && prono.butsB === butsExterieur) return "exact";
  const signe = (a: number, b: number) => Math.sign(a - b);
  return signe(prono.butsA, prono.butsB) === signe(butsDomicile, butsExterieur) ? "resultat" : "perdu";
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

export const chargerPronostics = cache(async (): Promise<DonneesPronostics> => {
  const calendrier = await chargerCalendrier();
  const parametres = PARAMETRES_CALIBRES;
  const elos = new Map(Object.entries(ratingsJson.ratings as Record<string, number>));
  const elo = (clef: string) => elos.get(clef) ?? 1500;

  const tracking: TrackingPronos = { joues: 0, exacts: 0, bonsResultats: 0, perdus: 0, points: 0 };
  const matchs: MatchEnrichi[] = [];
  const matchsSim: MatchSim[] = [];

  for (const m of [...calendrier].sort((a, b) => a.numero - b.numero)) {
    const domicile = m.domicile ? equipeDepuisNomFifa(m.domicile) : null;
    const exterieur = m.exterieur ? equipeDepuisNomFifa(m.exterieur) : null;
    const sim = versMatchSim(m, domicile, exterieur);
    matchsSim.push(sim);

    if (!domicile || !exterieur) {
      matchs.push({ calendrier: m, domicile, exterieur, prevision: null, scoresProbables: [], prono: null, verdict: null });
      continue;
    }

    // Prono avec les ratings du moment : pré-match pour un match joué.
    const prevision = prevoirMatch(elo(domicile.clef), elo(exterieur.clef), parametres, sim.bonusEloNet);
    const prono = pronoOptimal(prevision.matrice, BAREME_DEFAUT);
    let verdict: Verdict | null = null;

    if (m.joue) {
      verdict = jugerProno(prono, m.butsDomicile!, m.butsExterieur!);
      tracking.joues++;
      if (verdict === "exact") {
        tracking.exacts++;
        tracking.points += 3;
      } else if (verdict === "resultat") {
        tracking.bonsResultats++;
        tracking.points += 1;
      } else {
        tracking.perdus++;
      }

      // Le résultat réel entre dans les ratings pour la suite.
      const score = m.butsDomicile! > m.butsExterieur! ? 1 : m.butsDomicile! < m.butsExterieur! ? 0 : 0.5;
      const { deltaA, deltaB } = mettreAJourElo(
        elo(domicile.clef),
        elo(exterieur.clef),
        score,
        K_COUPE_DU_MONDE,
        m.butsDomicile! - m.butsExterieur!,
        sim.bonusEloNet,
      );
      elos.set(domicile.clef, elo(domicile.clef) + deltaA);
      elos.set(exterieur.clef, elo(exterieur.clef) + deltaB);
    }

    matchs.push({
      calendrier: m,
      domicile,
      exterieur,
      prevision,
      scoresProbables: topScores(prevision.matrice, 5),
      prono,
      verdict,
    });
  }

  const simulation = simulerTournoi(matchsSim, elos, parametres);

  return { matchs, simulation, elosLive: elos, tracking, genereLe: new Date().toISOString() };
});
