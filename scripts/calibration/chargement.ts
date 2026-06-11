// Lecture du dataset historique CC0 (data-raw/results.csv) : un match joué
// par ligne, du plus ancien au plus récent.

import { readFileSync } from "node:fs";
import { normaliserNom } from "../../src/lib/data/noms";

export interface MatchHistorique {
  date: string; // YYYY-MM-DD
  domicile: string; // clé normalisée
  exterieur: string;
  butsDomicile: number;
  butsExterieur: number;
  competition: string;
  terrainNeutre: boolean;
}

export function chargerMatchs(cheminCsv: string, depuis = "1980-01-01"): MatchHistorique[] {
  const lignes = readFileSync(cheminCsv, "utf8").split("\n");
  const matchs: MatchHistorique[] = [];
  for (const ligne of lignes.slice(1)) {
    const champs = ligne.split(",");
    if (champs.length < 9) continue;
    const [date, domicile, exterieur, bd, be, competition, , , neutre] = champs;
    if (date < depuis || bd === "NA" || bd === "") continue;
    matchs.push({
      date,
      domicile: normaliserNom(domicile),
      exterieur: normaliserNom(exterieur),
      butsDomicile: Number(bd),
      butsExterieur: Number(be),
      competition,
      terrainNeutre: neutre.trim().toUpperCase() === "TRUE",
    });
  }
  return matchs;
}

// Importance de la compétition → facteur K de la mise à jour Elo.
export function facteurK(competition: string): number {
  if (competition === "FIFA World Cup") return 60;
  if (/qualification/i.test(competition)) return 50;
  if (/^(UEFA Euro|Copa Am|African Cup|AFC Asian Cup|CONCACAF (Gold|Championship))/.test(competition)) return 50;
  if (/Nations League|Confederations Cup|Finalissima/i.test(competition)) return 40;
  if (/Friendly/i.test(competition)) return 25;
  return 35;
}
