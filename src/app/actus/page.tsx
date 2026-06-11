// Actus : billets courts, nourris par les chiffres du modèle (jamais inventés).

import Apparition from "@/components/anim/Apparition";
import Drapeau from "@/components/Drapeau";
import ratingsJson from "@/data/ratings.json";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";

export const revalidate = 1800;

export const metadata = {
  title: "Actus — Pronos·26",
  description: "Ce que disent les chiffres du Mondial 2026 : lectures du modèle, format à 48 équipes, mode d'emploi des pronos.",
};

export default async function PageActus() {
  const { matchs, simulation } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const joues = matchs.filter((m) => m.calendrier.joue).length;
  const [favori, deuxieme, troisieme] = simulation.probas.filter((p) => equipes.has(p.clef));
  const surprise = simulation.probas.filter((p) => equipes.has(p.clef)).find((p) => (equipes.get(p.clef)?.elo ?? 0) < 1950 && p.demies > 0.15);

  return (
    <Apparition className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 data-reveal className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Actus du modèle<span className="text-volt">.</span>
      </h1>
      <p data-reveal className="mt-2 text-sm text-brume">
        Pas de rumeurs de vestiaire ici : uniquement ce que les simulations racontent, mises à jour toutes les 30 minutes.
      </p>

      <div className="mt-8 space-y-6">
        <Billet etiquette="La course au titre" titre="Trois nations au-dessus du lot — mais un Mondial à 48 reste piégeux">
          <p>
            À l&apos;heure du calcul ({joues} match{joues > 1 ? "s" : ""} joué{joues > 1 ? "s" : ""} sur 104), trois
            nations — <Inline equipe={equipes.get(favori.clef)} />, <Inline equipe={equipes.get(deuxieme.clef)} /> et{" "}
            <Inline equipe={equipes.get(troisieme.clef)} />, dans un ordre que seul le boss connaît — cumulent{" "}
            {Math.round((favori.titre + deuxieme.titre + troisieme.titre) * 100)} % des titres simulés. Ce qui laisse
            quand même près d&apos;un tournoi sur deux au reste du plateau : à 48 équipes, les chemins de traverse
            existent. Les cotes détaillées sont sur la page dédiée… et le vainqueur prédit y reste flouté.
          </p>
          {surprise && (
            <p>
              L&apos;invité surprise des demi-finales simulées : <Inline equipe={equipes.get(surprise.clef)} />, présent
              dans le dernier carré {Math.round(surprise.demies * 100)} % du temps malgré un Elo hors du top niveau.
            </p>
          )}
        </Billet>

        <Billet etiquette="Le format" titre="48 équipes, 8 meilleurs troisièmes : pourquoi tout se joue au goal-average">
          <p>
            Nouveau format, nouvelle mécanique : 12 groupes de 4, les deux premiers passent, plus les{" "}
            <strong className="text-craie">8 meilleurs troisièmes</strong>{" "}sur 12. Concrètement, finir 3e avec 4 points
            et une différence de buts correcte qualifie presque toujours dans nos simulations — c&apos;est la marge de
            buts du dernier match de poule qui fait basculer les destins. Le modèle résout ensuite l&apos;affectation des
            troisièmes au tableau (chaque place n&apos;accepte que certains groupes) par couplage de contraintes, comme
            le fera la FIFA.
          </p>
        </Billet>

        <Billet etiquette="Mode d'emploi" titre="Lire un prono comme un pro : confiance, espérance, score voilé">
          <p>
            Chaque carte de match donne la probabilité 1·N·2, un niveau de confiance (élevée dès que l&apos;issue la plus
            probable dépasse 60 %) et un score conseillé calculé pour maximiser l&apos;espérance de points d&apos;un jeu
            de pronostics — pas pour faire joli. Ce score est flouté : la modélisation est publique, le pronostic final
            appartient au boss du game. La méthode complète, les sources de données et le backtest sur{" "}
            {ratingsJson.backtest.matchsEvalues} matchs sont détaillés sur la page Méthode.
          </p>
        </Billet>
      </div>
    </Apparition>
  );
}

function Billet({ etiquette, titre, children }: { etiquette: string; titre: string; children: React.ReactNode }) {
  return (
    <article data-reveal className="rounded-2xl border border-ligne bg-carte p-6 sm:p-7">
      <p className="font-data text-[10px] uppercase tracking-[0.25em] text-volt">{etiquette}</p>
      <h2 className="mt-2 font-display text-xl font-black leading-snug tracking-tight sm:text-2xl">{titre}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-brume">{children}</div>
    </article>
  );
}

function Inline({ equipe }: { equipe?: { nomFr: string; drapeau: string } }) {
  if (!equipe) return null;
  return (
    <span className="whitespace-nowrap font-medium text-craie">
      <Drapeau emoji={equipe.drapeau} nom={equipe.nomFr} taille="text-sm" /> {equipe.nomFr}
    </span>
  );
}
