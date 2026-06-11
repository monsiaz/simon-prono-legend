// Calendrier officiel + résultats live, via le feed public fixturedownload.com
// (MAJ ~quotidienne, sans clé). Fallback : snapshot embarqué, pour ne jamais
// rendre une page vide si le feed tombe.

import snapshot from "@/data/calendrier-snapshot.json";

const URL_FEED = "https://fixturedownload.com/feed/json/fifa-world-cup-2026";

interface EntreeFeed {
  MatchNumber: number;
  RoundNumber: number;
  DateUtc: string;
  Location: string;
  HomeTeam: string;
  AwayTeam: string;
  Group: string | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  Winner?: string | null;
}

export type Phase = "groupes" | "32es" | "8es" | "quarts" | "demies" | "petite-finale" | "finale";

export interface MatchCalendrier {
  numero: number;
  dateUtc: string;
  stade: string;
  phase: Phase;
  groupe: string | null; // "A" … "L"
  domicile: string | null; // nom FIFA, null si placeholder non résolu
  exterieur: string | null;
  placeholderDomicile: string | null; // ex. "1A", "3ABCDF", "V73"
  placeholderExterieur: string | null;
  butsDomicile: number | null;
  butsExterieur: number | null;
  joue: boolean;
  vainqueur: string | null; // rempli par le feed en phase finale (issue aux tirs au but)
}

function phaseDuTour(tour: number): Phase {
  if (tour <= 3) return "groupes";
  if (tour === 4) return "32es";
  if (tour === 5) return "8es";
  if (tour === 6) return "quarts";
  if (tour === 7) return "demies";
  return "finale";
}

const PLACEHOLDER = /^([123][A-L]|3[A-L]{4,6}|To be announced)$/i;

function normaliserEntree(e: EntreeFeed): MatchCalendrier {
  const estPlaceholder = (nom: string) => PLACEHOLDER.test(nom.trim());
  const phase = e.MatchNumber === 103 && phaseDuTour(e.RoundNumber) === "finale" ? "petite-finale" : phaseDuTour(e.RoundNumber);
  return {
    numero: e.MatchNumber,
    dateUtc: e.DateUtc,
    stade: e.Location,
    phase,
    groupe: e.Group ? e.Group.replace("Group ", "") : null,
    domicile: estPlaceholder(e.HomeTeam) ? null : e.HomeTeam,
    exterieur: estPlaceholder(e.AwayTeam) ? null : e.AwayTeam,
    placeholderDomicile: estPlaceholder(e.HomeTeam) ? e.HomeTeam.trim() : null,
    placeholderExterieur: estPlaceholder(e.AwayTeam) ? e.AwayTeam.trim() : null,
    butsDomicile: e.HomeTeamScore,
    butsExterieur: e.AwayTeamScore,
    joue: e.HomeTeamScore != null && e.AwayTeamScore != null,
    vainqueur: e.Winner?.trim() || null,
  };
}

export function normaliserCalendrier(entrees: EntreeFeed[]): MatchCalendrier[] {
  return entrees.map(normaliserEntree).sort((a, b) => a.numero - b.numero);
}

export async function chargerCalendrier(): Promise<MatchCalendrier[]> {
  try {
    const reponse = await fetch(URL_FEED, { next: { revalidate: 1800 } });
    if (!reponse.ok) throw new Error(`feed ${reponse.status}`);
    return normaliserCalendrier((await reponse.json()) as EntreeFeed[]);
  } catch {
    return normaliserCalendrier(snapshot as EntreeFeed[]);
  }
}
