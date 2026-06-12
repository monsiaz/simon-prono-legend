// Buteurs : les 30 joueurs des 48 qualifiés les plus en forme devant le but,
// d'après les buts en sélection depuis janvier 2024 (dataset ouvert CC0).

import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import Drapeau from "@/components/Drapeau";
import Vignette from "@/components/Vignette";
import buteursJson from "@/data/buteurs.json";
import { toutesLesEquipes } from "@/lib/data/equipes";

export const metadata = {
  title: "Les buteurs — Simon Prono Legend",
  description: "Les buteurs les plus en forme du plateau, classés sur leurs buts en sélection depuis 2024. Données ouvertes, zéro folklore.",
};

export default function PageButeurs() {
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const buteurs = buteursJson.buteurs.filter((b) => equipes.has(b.equipe));
  const [or, argent, bronze, ...reste] = buteurs;
  const maxButs = or?.buts ?? 1;

  return (
    <Apparition className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div data-reveal className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Les buteurs en forme<span className="text-volt">.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-brume">
            Classement sur les buts en sélection depuis janvier 2024, hors buts contre son camp, pénaltys comptés
            moitié. Les buts du Mondial s&apos;ajouteront au fil du tournoi.
          </p>
        </div>
        <Vignette src="/visuels/bd-but.webp" taille={120} className="hidden w-28 sm:block" />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[or, argent, bronze].map((buteur, rang) => {
          if (!buteur) return null;
          const equipe = equipes.get(buteur.equipe)!;
          const styles = [
            "border-or/60 sm:order-2 sm:-translate-y-2",
            "border-craie/30 sm:order-1",
            "border-volt/40 sm:order-3",
          ];
          return (
            <div key={buteur.nom} data-reveal className={`rounded-2xl border bg-carte p-5 text-center ${styles[rang]}`}>
              <p className="font-display text-4xl font-black text-or">{rang + 1}</p>
              <p className="mt-2 font-display text-lg font-bold leading-tight">{buteur.nom}</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 font-data text-xs text-brume">
                <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="xs" />
                {equipe.nomFr}
              </p>
              <p className="mt-3 font-display text-3xl font-black text-volt">{buteur.buts}</p>
              <p className="font-data text-[10px] uppercase tracking-wider text-brume">
                buts · dont {buteur.penaltys} pén. · {buteur.matchsAvecBut} matchs marqués
              </p>
            </div>
          );
        })}
      </div>

      <div data-reveal className="mt-6 overflow-hidden rounded-2xl border border-ligne bg-carte">
        <table className="w-full text-sm">
          <caption className="sr-only">Classement des buteurs depuis 2024</caption>
          <thead>
            <tr className="border-b border-ligne font-data text-xs uppercase tracking-wider text-brume">
              <th scope="col" className="px-4 py-3 text-left font-normal">Joueur</th>
              <th scope="col" className="hidden px-3 py-3 text-right font-normal sm:table-cell">Pénaltys</th>
              <th scope="col" className="px-3 py-3 text-right font-normal">Buts</th>
              <th scope="col" className="w-[30%] px-4 py-3 text-left font-normal">Depuis 2024</th>
            </tr>
          </thead>
          <tbody>
            {reste.map((buteur, i) => {
              const equipe = equipes.get(buteur.equipe)!;
              return (
                <tr key={buteur.nom} className="border-b border-ligne/60 transition-colors last:border-0 hover:bg-surface">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 font-data text-xs text-brume">{i + 4}</span>
                      <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="xs" />
                      <span className="font-medium">{buteur.nom}</span>
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-right font-data text-brume sm:table-cell">{buteur.penaltys}</td>
                  <td className="px-3 py-2.5 text-right font-data font-bold text-volt">{buteur.buts}</td>
                  <td className="px-4 py-2.5">
                    <BarreRemplie proportion={buteur.buts / maxButs} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Apparition>
  );
}
