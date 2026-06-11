// Accueil : tous les matchs, groupés par journée, avec prono et score exact.

import Apparition from "@/components/anim/Apparition";
import CompteurProba from "@/components/anim/CompteurProba";
import CarteMatch from "@/components/CarteMatch";
import Drapeau from "@/components/Drapeau";
import FlouBoss from "@/components/FlouBoss";
import VideoLegende from "@/components/VideoLegende";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";
import { jourFr } from "@/lib/ui/format";

export const revalidate = 1800;

export default async function PageAccueil() {
  const { matchs, simulation } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const favoris = simulation.probas.slice(0, 5);

  const parJour = new Map<string, typeof matchs>();
  for (const match of matchs) {
    const jour = jourFr(match.calendrier.dateUtc);
    parJour.set(jour, [...(parJour.get(jour) ?? []), match]);
  }

  return (
    <Apparition>
      <section className="terrain-filigrane border-b border-ligne">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto]">
          <div>
            <p data-reveal className="font-data text-xs uppercase tracking-[0.3em] text-volt">
              Coupe du Monde 2026 · 11 juin – 19 juillet
            </p>
            <h1 data-reveal className="mt-3 max-w-3xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Le prono de chaque match,
              <span className="text-volt"> score exact compris.</span>
            </h1>
            <p data-reveal className="mt-4 max-w-xl text-sm leading-relaxed text-brume sm:text-base">
              Probabilités et scores conseillés issus d&apos;un modèle maison — Elo pondéré, Poisson bivarié,
              10 000 simulations Monte Carlo — recalculé après chaque coup de sifflet final.
            </p>
          </div>
          <div data-reveal className="lg:w-[300px]">
            <VideoLegende />
          </div>
          <div data-reveal className="flex flex-wrap gap-3 lg:col-span-2">
            {favoris.map((proba, rang) => {
              const equipe = equipes.get(proba.clef);
              if (!equipe) return null;
              const contenu = (
                <span className="flex items-center gap-2.5">
                  <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="sm" />
                  <span className="text-sm font-medium">{equipe.nomFr}</span>
                </span>
              );
              return (
                <div key={proba.clef} className="flex items-center gap-2.5 rounded-full border border-ligne bg-carte py-2 pl-3 pr-4">
                  <span className="font-data text-xs text-brume">{rang + 1}</span>
                  {rang === 0 ? <FlouBoss className="flex items-center">{contenu}</FlouBoss> : contenu}
                  <CompteurProba valeur={proba.titre} decimales={0} className="font-data text-sm font-bold text-volt" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {[...parJour.entries()].map(([jour, matchsDuJour]) => (
          <div key={jour} className="mb-10">
            <h2 data-reveal className="mb-4 flex items-baseline gap-3 font-display text-lg font-black uppercase tracking-tight">
              {jour}
              <span className="font-data text-xs font-normal normal-case tracking-normal text-brume">
                {matchsDuJour.length} match{matchsDuJour.length > 1 ? "s" : ""}
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {matchsDuJour.map((match) => (
                <CarteMatch key={match.calendrier.numero} match={match} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </Apparition>
  );
}
