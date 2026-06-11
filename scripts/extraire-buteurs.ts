// Extrait les buteurs en forme parmi les 48 qualifiés, depuis le dataset CC0
// (goalscorers.csv). Score de forme : buts depuis 2024, hors buts contre son
// camp, les pénaltys comptant moitié. Sortie : src/data/buteurs.json.
//
// Usage : npx tsx scripts/extraire-buteurs.ts [chemin-goalscorers.csv]

import { readFileSync, writeFileSync } from "node:fs";
import { normaliserNom } from "../src/lib/data/noms";

const QUALIFIES = new Set([
  "algeria", "argentina", "australia", "austria", "belgium", "bosnia-and-herzegovina", "brazil",
  "cape-verde", "canada", "colombia", "dr-congo", "croatia", "curacao", "czech-republic",
  "ivory-coast", "ecuador", "egypt", "england", "france", "germany", "ghana", "haiti", "iran",
  "iraq", "japan", "jordan", "south-korea", "mexico", "morocco", "netherlands", "new-zealand",
  "norway", "panama", "paraguay", "portugal", "qatar", "saudi-arabia", "scotland", "senegal",
  "south-africa", "spain", "sweden", "switzerland", "tunisia", "turkey", "united-states",
  "uruguay", "uzbekistan",
]);

const DEPUIS = "2024-01-01";
const cheminCsv = process.argv[2] ?? "data-raw/goalscorers.csv";

interface Cumul {
  nom: string;
  equipe: string;
  buts: number;
  penaltys: number;
  matchsAvecBut: Set<string>;
  dernierBut: string;
}

const buteurs = new Map<string, Cumul>();
const lignes = readFileSync(cheminCsv, "utf8").split("\n");
for (const ligne of lignes.slice(1)) {
  const champs = ligne.split(",");
  if (champs.length < 8) continue;
  const [date, domicile, exterieur, equipe, buteur, , contreSonCamp, penalty] = champs;
  if (date < DEPUIS || !buteur || buteur === "NA" || contreSonCamp.trim().toUpperCase() === "TRUE") continue;
  const clefEquipe = normaliserNom(equipe);
  if (!QUALIFIES.has(clefEquipe)) continue;
  const clef = `${buteur}|${clefEquipe}`;
  const cumul = buteurs.get(clef) ?? { nom: buteur, equipe: clefEquipe, buts: 0, penaltys: 0, matchsAvecBut: new Set<string>(), dernierBut: date };
  cumul.buts++;
  if (penalty.trim().toUpperCase() === "TRUE") cumul.penaltys++;
  cumul.matchsAvecBut.add(`${date}|${domicile}|${exterieur}`);
  if (date > cumul.dernierBut) cumul.dernierBut = date;
  buteurs.set(clef, cumul);
}

const classement = [...buteurs.values()]
  .map((b) => ({
    nom: b.nom,
    equipe: b.equipe,
    buts: b.buts,
    penaltys: b.penaltys,
    matchsAvecBut: b.matchsAvecBut.size,
    dernierBut: b.dernierBut,
    // Forme : un pénalty vaut un demi-but dans le classement.
    forme: b.buts - b.penaltys * 0.5,
  }))
  .sort((a, b) => b.forme - a.forme || b.buts - a.buts)
  .slice(0, 30);

writeFileSync(
  "src/data/buteurs.json",
  JSON.stringify({ genereLe: new Date().toISOString(), fenetre: `${DEPUIS} → aujourd'hui`, buteurs: classement }, null, 1),
);
console.log(`src/data/buteurs.json écrit (${classement.length} buteurs)`);
console.log(classement.slice(0, 5).map((b) => `${b.nom} (${b.equipe}) ${b.buts} buts dont ${b.penaltys} pén.`).join("\n"));
