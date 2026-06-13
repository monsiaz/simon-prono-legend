// Calendrier officiel + résultats live, via le feed public fixturedownload.com
// (MAJ ~quotidienne, sans clé). Fallback : snapshot embarqué, pour ne jamais
// rendre une page vide si le feed tombe.

import snapshot from "@/data/calendrier-snapshot.json";

const URL_FEED = "https://fixturedownload.com/feed/json/fifa-world-cup-2026";
const TIMEOUT_FEED_MS = 8000;

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

// Le feed renseigne Winner="Draw" sur un match nul : ce n'est pas une équipe.
// Seul un vrai vainqueur (départage aux tirs au but en phase finale) doit être
// conservé ; tout le reste (nul, vide) vaut "pas de vainqueur".
export function vainqueurReel(winner: string | null | undefined): string | null {
  const nom = winner?.trim();
  if (!nom || nom.toLowerCase() === "draw") return null;
  return nom;
}

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
    vainqueur: vainqueurReel(e.Winner),
  };
}

export function normaliserCalendrier(entrees: EntreeFeed[]): MatchCalendrier[] {
  return entrees.map(normaliserEntree).sort((a, b) => a.numero - b.numero);
}

export async function chargerCalendrier(): Promise<MatchCalendrier[]> {
  // Le snapshot est rafraîchi hors-ligne par l'ingestion CI (.github/workflows/
  // ingestion.yml), donc fiable même périmé de quelques heures. Le fetch live
  // n'est qu'un bonus : on l'abandonne vite (8 s) car le feed peut mettre >20 s,
  // ce qui dépasse le timeout de la fonction Vercel et nous fait servir un
  // snapshot muet. Tout échec est tracé pour rester visible.
  try {
    const reponse = await fetch(URL_FEED, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(TIMEOUT_FEED_MS),
    });
    if (!reponse.ok) throw new Error(`feed HTTP ${reponse.status}`);
    return normaliserCalendrier((await reponse.json()) as EntreeFeed[]);
  } catch (erreur) {
    console.error("[calendrier] feed live KO, repli sur snapshot embarqué :", erreur);
    return normaliserCalendrier(snapshot as EntreeFeed[]);
  }
}
