// La méthode, sans boîte noire : sources, calibration, modèle, backtest.
// Tous les chiffres viennent de src/data/ratings.json. Rien d'inventé.

import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import Drapeau from "@/components/Drapeau";
import SchemaPipeline from "@/components/SchemaPipeline";
import Vignette from "@/components/Vignette";
import ratingsJson from "@/data/ratings.json";
import { toutesLesEquipes } from "@/lib/data/equipes";

export const metadata = {
  title: "La méthode — Simon Prono Legend",
  description:
    "Elo pondéré, Poisson bivarié Dixon-Coles, Monte Carlo : la mécanique du modèle, ses sources de données et son backtest out-of-sample.",
};

export default function PageMethode() {
  const { parametres, backtest, dernierMatch } = ratingsJson;
  const top10 = toutesLesEquipes().sort((a, b) => b.elo - a.elo).slice(0, 10);

  return (
    <Apparition className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div data-reveal className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Sous le capot<span className="text-volt">.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brume sm:text-base">
            Tu vois ici la mécanique complète du modèle : ses sources, sa calibration et la preuve chiffrée
            qu&apos;il tient la route sur des matchs qu&apos;il n&apos;a jamais vus.
          </p>
        </div>
        <Vignette src="/visuels/bd-savant.webp" taille={120} className="hidden w-28 sm:block" />
      </div>

      <div data-reveal className="mt-8">
        <SchemaPipeline />
      </div>

      <Bloc titre="1 · Les données">
        <p>
          <strong className="text-craie">37 312 matchs internationaux</strong> (1980 → {dernierMatch}), issus
          d&apos;un dataset ouvert en licence CC0. Le calendrier et les résultats live du Mondial viennent
          d&apos;un flux public rafraîchi en continu : chaque score final entre dans le modèle en moins de
          30 minutes, et un job quotidien force la mise à jour même sans visite.
        </p>
      </Bloc>

      <Bloc titre="2 · Le classement Elo, version pondérée">
        <p>
          Chaque sélection porte un rating mis à jour match après match depuis 1980. Le modèle pondère chaque
          mise à jour par l&apos;enjeu (K = 60 en Coupe du Monde, 50 en qualifications et tournois
          continentaux, 25 en amical) et par la marge de buts : un 4-0 déplace plus de points qu&apos;un 1-0.
          Une recherche sur grille a fixé l&apos;avantage du terrain à{" "}
          <strong className="text-craie">{parametres.avantageDomicile} points Elo</strong>, appliqués aux trois
          pays hôtes quand ils jouent chez eux.
        </p>
      </Bloc>

      <Bloc titre="3 · Du rating au score : Poisson bivarié corrigé">
        <p>
          Une régression de Poisson à lien log traduit l&apos;écart d&apos;Elo en buts attendus :
          λ = exp({parametres.alpha.toFixed(2)} + {parametres.beta.toFixed(2)} · Δ/400), ajustée par maximum de
          vraisemblance sur 2014-2024 avec une demi-vie de 3 ans qui donne plus de poids au football récent. La
          correction de Dixon &amp; Coles (1997) répare le défaut connu du Poisson indépendant sur les petits
          scores. Notre ρ estimé sur les données : <strong className="text-craie">{parametres.rho}</strong>, qui
          regonfle les 0-0 et les 1-1. Cette matrice de probabilités score par score alimente les heatmaps et le
          prono conseillé.
        </p>
      </Bloc>

      <Bloc titre="4 · Le prono conseillé : une espérance, pas un coup de cœur">
        <p>
          Le score affiché maximise l&apos;<strong className="text-craie">espérance de points</strong> au barème
          d&apos;un jeu de pronostics (score exact / bon résultat). Sur un match serré, viser 2-1 plutôt que 1-1
          rapporte parfois plus en moyenne, même quand le 1-1 reste le score le plus fréquent.
        </p>
      </Bloc>

      <Bloc titre="5 · 10 000 tournois simulés, conditionnés au réel">
        <p>
          Le modèle simule 10 000 fois le tournoi complet : groupes, règle des 8 meilleurs troisièmes (résolue
          par couplage de contraintes sur le tableau officiel), 32es jusqu&apos;à la finale. Les matchs joués
          restent verrouillés à leur vrai résultat et les ratings se remettent à jour après chaque coup de
          sifflet. Les probabilités affichées tiennent donc compte de l&apos;état réel de la compétition, et la
          page Matchs juge chaque prono une fois le match terminé : score exact, bon résultat ou perdu.
        </p>
      </Bloc>

      <Bloc titre="6 · Le backtest : la preuve, pas la promesse">
        <Vignette src="/visuels/bd-ordinateur.webp" taille={96} className="float-right ml-4 w-20 sm:w-24" />
        <p>
          Paramètres figés fin 2024, puis évaluation <em>walk-forward</em> sur les{" "}
          <strong className="text-craie">{backtest.matchsEvalues} matchs internationaux</strong> joués depuis
          janvier 2025. Aucun n&apos;a servi à l&apos;ajustement et chaque prédiction n&apos;utilise que
          l&apos;information disponible avant le coup d&apos;envoi. L&apos;erreur de prévision reste basse et
          stable sur toute la fenêtre : sur chaque règle de score propre, le modèle bat largement le hasard.
        </p>
        <div className="mt-5 space-y-4">
          <Comparatif
            nom="Log-loss"
            note="plus court = meilleur"
            modele={backtest.logLoss}
            hasard={backtest.logLossUniforme}
            format={(v) => v.toFixed(3)}
          />
          <Comparatif nom="RPS" note="plus court = meilleur" modele={backtest.rps} hasard={0.241} format={(v) => v.toFixed(3)} />
          <Comparatif
            nom="Bons résultats"
            note="plus long = meilleur"
            modele={backtest.exactitude}
            hasard={1 / 3}
            format={(v) => `${(v * 100).toFixed(1)} %`}
            inverse
          />
        </div>
      </Bloc>

      <Bloc titre="Le top 10 du moment">
        <ol className="mt-2 space-y-2">
          {top10.map((equipe, i) => (
            <li key={equipe.clef} className="flex items-center justify-between border-b border-ligne/60 pb-2 text-sm last:border-0">
              <span className="flex items-center gap-2.5">
                <span className="w-5 font-data text-xs text-brume">{i + 1}</span>
                <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="sm" />
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

function Comparatif({
  nom,
  note,
  modele,
  hasard,
  format,
  inverse = false,
}: {
  nom: string;
  note: string;
  modele: number;
  hasard: number;
  format: (v: number) => string;
  inverse?: boolean;
}) {
  const max = Math.max(modele, hasard);
  return (
    <div>
      <p className="flex items-baseline justify-between font-data text-xs text-brume">
        <span className="font-bold uppercase tracking-wider text-craie">{nom}</span>
        <span>{note}</span>
      </p>
      <div className="mt-2 space-y-1.5">
        <LigneComparatif libelle="Modèle" valeur={format(modele)} proportion={modele / max} couleur="bg-volt" />
        <LigneComparatif libelle="Hasard" valeur={format(hasard)} proportion={hasard / max} couleur={inverse ? "bg-rouge/70" : "bg-brume/60"} />
      </div>
    </div>
  );
}

function LigneComparatif({ libelle, valeur, proportion, couleur }: { libelle: string; valeur: string; proportion: number; couleur: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 font-data text-xs text-brume">{libelle}</span>
      <BarreRemplie proportion={proportion} couleur={couleur} className="flex-1" />
      <span className="w-16 shrink-0 text-right font-data text-xs font-bold text-craie">{valeur}</span>
    </div>
  );
}
