// Ingestion du calendrier + résultats officiels dans le snapshot embarqué.
// Lancé par la CI (.github/workflows/ingestion.yml) toutes les ~3 h : un runner
// n'a pas le timeout serverless de Vercel, il peut donc encaisser un feed lent
// (>20 s) là où le fetch request-time abandonne. Le snapshot ainsi rafraîchi
// devient la source fiable servie en prod. Exécuter : npx tsx scripts/ingerer-calendrier.ts

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const URL_FEED = "https://fixturedownload.com/feed/json/fifa-world-cup-2026";
const CHEMIN_SNAPSHOT = resolve(process.cwd(), "src/data/calendrier-snapshot.json");
const TIMEOUT_MS = 60_000;

interface EntreeFeed {
  MatchNumber: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
}

function nbJoues(entrees: EntreeFeed[]): number {
  return entrees.filter((e) => e.HomeTeamScore != null && e.AwayTeamScore != null).length;
}

async function ingerer(): Promise<void> {
  const reponse = await fetch(URL_FEED, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!reponse.ok) throw new Error(`feed HTTP ${reponse.status}`);

  const entrees = (await reponse.json()) as EntreeFeed[];
  if (!Array.isArray(entrees) || entrees.length === 0) {
    throw new Error("feed vide ou malformé — abandon pour ne pas écraser un bon snapshot");
  }

  await writeFile(CHEMIN_SNAPSHOT, JSON.stringify(entrees), "utf8");
  console.log(`Snapshot écrit : ${entrees.length} matchs, ${nbJoues(entrees)} joués.`);
}

ingerer().catch((erreur) => {
  console.error("Ingestion échouée :", erreur);
  process.exit(1);
});
