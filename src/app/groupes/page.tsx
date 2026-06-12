// Groupes : pour chacun des 12 groupes, probabilité de sortie de groupe
// (1er/2e ou repêché parmi les 8 meilleurs 3es) par équipe.

import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import Drapeau from "@/components/Drapeau";
import Vignette from "@/components/Vignette";
import { equipeDepuisNomFifa } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";

export const revalidate = 1800;

export default async function PageGroupes() {
  const { matchs, simulation } = await chargerPronostics();
  const probaParClef = new Map(simulation.probas.map((p) => [p.clef, p]));

  const groupes = new Map<string, Set<string>>();
  for (const { calendrier: m } of matchs) {
    if (!m.groupe || !m.domicile || !m.exterieur) continue;
    const ensemble = groupes.get(m.groupe) ?? new Set<string>();
    ensemble.add(m.domicile);
    ensemble.add(m.exterieur);
    groupes.set(m.groupe, ensemble);
  }

  return (
    <Apparition className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div data-reveal className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Sortie de groupes<span className="text-volt">.</span>
        </h1>
        <Vignette src="/visuels/bd-gardien.webp" taille={104} className="hidden w-24 sm:block" />
      </div>
      <p data-reveal className="mt-2 max-w-xl text-sm text-brume">
        Probabilité d&apos;atteindre les 32es, en direct (1er ou 2e) ou repêchée parmi les 8 meilleurs troisièmes,
        sur {simulation.nSims.toLocaleString("fr-FR")} simulations du tournoi.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...groupes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([nom, nomsFifa]) => {
          const lignes = [...nomsFifa]
            .map((nomFifa) => {
              const equipe = equipeDepuisNomFifa(nomFifa);
              return { equipe, proba: probaParClef.get(equipe.clef)?.sortieGroupes ?? 0 };
            })
            .sort((a, b) => b.proba - a.proba);
          return (
            <section key={nom} data-reveal className="rounded-2xl border border-ligne bg-carte p-5">
              <h2 className="flex items-baseline justify-between font-display text-lg font-black uppercase">
                Groupe {nom}
              </h2>
              <ul className="mt-4 space-y-3">
                {lignes.map(({ equipe, proba }) => (
                  <li key={equipe.clef}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="sm" />
                        {equipe.nomFr}
                      </span>
                      <span className="font-data font-bold text-craie">{Math.round(proba * 100)} %</span>
                    </div>
                    <BarreRemplie className="mt-1.5" proportion={proba} couleur={proba >= 0.5 ? "bg-volt" : "bg-brume"} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Apparition>
  );
}
