// La méthode, sans boîte noire : sources, calibration, modèle, backtest.
// Tous les chiffres viennent de src/data/ratings.json — rien d'inventé.

import Apparition from "@/components/anim/Apparition";
import Drapeau from "@/components/Drapeau";
import ratingsJson from "@/data/ratings.json";
import { toutesLesEquipes } from "@/lib/data/equipes";

export const metadata = {
  title: "La méthode — Pronos·26",
  description: "Elo pondéré, Poisson bivarié Dixon-Coles, Monte Carlo : la mécanique complète du modèle, ses sources de données et son backtest out-of-sample.",
};

export default function PageMethode() {
  const { parametres, backtest, dernierMatch } = ratingsJson;
  const top10 = toutesLesEquipes().sort((a, b) => b.elo - a.elo).slice(0, 10);

  return (
    <Apparition className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 data-reveal className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Sous le capot<span className="text-volt">.</span>
      </h1>
      <p data-reveal className="mt-3 text-sm leading-relaxed text-brume sm:text-base">
        Pas de boîte noire, pas de cotes recopiées chez un bookmaker : un modèle statistique complet, reproductible,
        et évalué honnêtement sur des matchs qu&apos;il n&apos;a jamais vus.
      </p>

      <Bloc titre="1 · Les données">
        <p>
          <strong className="text-craie">37 312 matchs internationaux</strong> (1980 → {dernierMatch}), issus d&apos;un
          dataset ouvert en licence CC0 maintenu publiquement. Le calendrier et les résultats live du Mondial viennent
          d&apos;un flux public rafraîchi en continu — chaque score final entre dans le modèle en moins de 30 minutes.
        </p>
      </Bloc>

      <Bloc titre="2 · Le classement Elo, version pondérée">
        <p>
          Chaque sélection porte un rating mis à jour match après match depuis 1980. La mise à jour est pondérée par
          l&apos;enjeu (K = 60 en Coupe du Monde, 50 en qualifications et tournois continentaux, 25 en amical) et par la
          marge de buts (un 4-0 déplace plus de points qu&apos;un 1-0). L&apos;avantage du terrain n&apos;est pas une
          opinion : il est estimé par recherche sur grille et vaut <strong className="text-craie">{parametres.avantageDomicile} points Elo</strong> —
          appliqué aux trois pays hôtes quand ils jouent chez eux.
        </p>
      </Bloc>

      <Bloc titre="3 · Du rating au score : Poisson bivarié corrigé">
        <p>
          L&apos;écart d&apos;Elo se traduit en buts attendus par une régression de Poisson à lien log,
          λ = exp({parametres.alpha.toFixed(2)} + {parametres.beta.toFixed(2)} · Δ/400), ajustée par maximum de
          vraisemblance sur 2014-2024 avec pondération de récence (demi-vie 3 ans). La correction de Dixon &amp; Coles
          (1997) corrige le défaut connu du Poisson indépendant sur les petits scores — notre ρ estimé :{" "}
          <strong className="text-craie">{parametres.rho}</strong>, qui regonfle les 0-0 et 1-1. C&apos;est cette matrice
          de probabilités score par score qui alimente les heatmaps et le prono conseillé.
        </p>
      </Bloc>

      <Bloc titre="4 · Le prono conseillé : une espérance, pas un coup de cœur">
        <p>
          Le score affiché n&apos;est pas toujours le plus probable : c&apos;est celui qui maximise
          l&apos;<strong className="text-craie">espérance de points</strong> au barème d&apos;un jeu de pronostics
          (score exact / bon résultat). Sur un match serré, viser 2-1 plutôt que 1-1 peut rapporter plus en moyenne,
          même si le 1-1 est légèrement plus fréquent.
        </p>
      </Bloc>

      <Bloc titre="5 · 10 000 tournois simulés, conditionnés au réel">
        <p>
          Le tournoi complet — groupes, règle des 8 meilleurs troisièmes (résolue par couplage de contraintes sur le
          tableau officiel), 32es jusqu&apos;à la finale — est simulé 10 000 fois. Les matchs déjà joués sont
          verrouillés à leur vrai résultat, les ratings sont remis à jour après chaque coup de sifflet : les
          probabilités affichées sont donc conditionnelles à l&apos;état réel de la compétition.
        </p>
      </Bloc>

      <Bloc titre="6 · Le backtest : la preuve, pas la promesse">
        <p>
          Paramètres figés fin 2024, évaluation <em>walk-forward</em> sur les{" "}
          <strong className="text-craie">{backtest.matchsEvalues} matchs internationaux</strong> joués depuis janvier 2025 —
          aucun n&apos;a servi à l&apos;ajustement, et chaque prédiction n&apos;utilise que l&apos;information disponible
          avant le coup d&apos;envoi.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metrique nom="Log-loss" valeur={backtest.logLoss.toFixed(3)} reference={`hasard ${backtest.logLossUniforme.toFixed(2)}`} />
          <Metrique nom="RPS" valeur={backtest.rps.toFixed(3)} reference="hasard ≈ 0.24" />
          <Metrique nom="Bon résultat" valeur={`${(backtest.exactitude * 100).toFixed(1)} %`} reference="hasard 33 %" />
          <Metrique nom="Fenêtre" valeur="2025-26" reference="out-of-sample" />
        </dl>
      </Bloc>

      <Bloc titre="Le top 10 du moment">
        <ol className="mt-2 space-y-2">
          {top10.map((equipe, i) => (
            <li key={equipe.clef} className="flex items-center justify-between border-b border-ligne/60 pb-2 text-sm last:border-0">
              <span className="flex items-center gap-2.5">
                <span className="w-5 font-data text-xs text-brume">{i + 1}</span>
                <Drapeau emoji={equipe.drapeau} nom={equipe.nomFr} taille="text-lg" />
                {equipe.nomFr}
              </span>
              <span className="font-data font-bold text-volt">{equipe.elo}</span>
            </li>
          ))}
        </ol>
      </Bloc>
    </Apparition>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section data-reveal className="mt-8 rounded-2xl border border-ligne bg-carte p-6">
      <h2 className="font-display text-base font-black uppercase tracking-tight text-volt">{titre}</h2>
      <div className="mt-3 text-sm leading-relaxed text-brume">{children}</div>
    </section>
  );
}

function Metrique({ nom, valeur, reference }: { nom: string; valeur: string; reference: string }) {
  return (
    <div className="rounded-xl border border-ligne bg-surface p-3">
      <dt className="font-data text-[10px] uppercase tracking-wider text-brume">{nom}</dt>
      <dd className="mt-1 font-display text-xl font-black text-craie">{valeur}</dd>
      <dd className="font-data text-[10px] text-brume">{reference}</dd>
    </div>
  );
}
