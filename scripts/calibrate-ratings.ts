// Pipeline de calibration complet :
//   1. avantage domicile par recherche sur grille (Brier de l'expectancy Elo)
//   2. passe Elo chronologique 1980 → aujourd'hui (K pondéré par importance)
//   3. ajustement (α, β, ρ) sur 2014 → 2024, pondéré par récence
//   4. backtest out-of-sample sur 2025 → aujourd'hui
//   5. écriture de src/data/ratings.json (consommé par l'app)
//
// Usage : npx tsx scripts/calibrate-ratings.ts [chemin-results.csv]

import { writeFileSync } from "node:fs";
import { ajusterAlphaBeta, ajusterRho } from "./calibration/ajustement";
import { backtester } from "./calibration/backtest";
import { chargerMatchs } from "./calibration/chargement";
import { brierExpectancy, passeElo } from "./calibration/passe-elo";

const cheminCsv = process.argv[2] ?? "data-raw/results.csv";
const FIN_AJUSTEMENT = "2025-01-01"; // avant : ajustement — après : backtest

const matchs = chargerMatchs(cheminCsv);
const reference = matchs[matchs.length - 1].date;
console.log(`${matchs.length} matchs chargés (1980 → ${reference})`);

// 1. Avantage domicile.
let avantageDomicile = 50;
let meilleurBrier = Infinity;
for (const candidat of [0, 25, 50, 65, 80, 100, 125]) {
  const { observations } = passeElo(matchs, candidat);
  const brier = brierExpectancy(observations, candidat);
  console.log(`  avantage domicile ${candidat} → Brier ${brier.toFixed(5)}`);
  if (brier < meilleurBrier) {
    meilleurBrier = brier;
    avantageDomicile = candidat;
  }
}
console.log(`avantage domicile retenu : ${avantageDomicile}`);

// 2. Passe Elo définitive.
const { ratings, observations } = passeElo(matchs, avantageDomicile);
const ajustement = observations.filter((o) => o.date < FIN_AJUSTEMENT);
const evaluation = observations.filter((o) => o.date >= FIN_AJUSTEMENT);

// 3. Paramètres du modèle de buts.
const { alpha, beta } = ajusterAlphaBeta(ajustement, avantageDomicile, reference);
const rho = ajusterRho(ajustement, avantageDomicile, alpha, beta, reference);
console.log(`α=${alpha.toFixed(3)} β=${beta.toFixed(3)} ρ=${rho} (λ égaux=${Math.exp(alpha).toFixed(2)} buts)`);

// 4. Backtest out-of-sample.
const parametres = { alpha, beta, rho, avantageDomicile };
const scores = backtester(evaluation, parametres);
console.log(
  `backtest ${scores.matchsEvalues} matchs (≥ ${FIN_AJUSTEMENT}) : ` +
    `log-loss ${scores.logLoss.toFixed(3)} (uniforme ${scores.logLossUniforme.toFixed(3)}) · ` +
    `RPS ${scores.rps.toFixed(3)} · exactitude ${(scores.exactitude * 100).toFixed(1)}%`,
);
if (scores.logLoss >= scores.logLossUniforme) {
  throw new Error("Le modèle ne bat pas la baseline uniforme — calibration rejetée.");
}

// 5. Sortie.
const sortie = {
  genereLe: new Date().toISOString(),
  source: "martj42/international_results (CC0)",
  dernierMatch: reference,
  parametres,
  backtest: scores,
  ratings: Object.fromEntries([...ratings.entries()].sort((a, b) => b[1] - a[1]).map(([n, r]) => [n, Math.round(r)])),
};
writeFileSync("src/data/ratings.json", JSON.stringify(sortie, null, 1));
console.log(`src/data/ratings.json écrit (${ratings.size} équipes)`);
