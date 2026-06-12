// Cotes : probabilités de titre et de parcours, du favori à l'outsider.

import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import CompteurProba from "@/components/anim/CompteurProba";
import Drapeau from "@/components/Drapeau";
import FlouBoss from "@/components/FlouBoss";
import ScoreFloute from "@/components/ScoreFloute";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";

export const revalidate = 1800;

const COLONNES = [
  { clef: "quarts", libelle: "Quarts" },
  { clef: "demies", libelle: "Demies" },
  { clef: "finale", libelle: "Finale" },
  { clef: "titre", libelle: "Titre" },
] as const;

export default async function PageCotes() {
  const { simulation, genereLe } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const classement = simulation.probas.filter((p) => equipes.has(p.clef)).slice(0, 24);
  const [favori, ...poursuivants] = classement;
  const equipeFavorite = equipes.get(favori.clef)!;

  return (
    <Apparition className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 data-reveal className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Qui soulève la coupe<span className="text-volt"> ?</span>
      </h1>
      <p data-reveal className="mt-2 max-w-xl text-sm text-brume">
        {simulation.nSims.toLocaleString("fr-FR")} tournois simulés, conditionnés sur les résultats déjà acquis.
        Recalculé toutes les 30 minutes.
      </p>

      <section
        data-reveal
        className="terrain-filigrane mt-8 flex flex-col items-start gap-4 rounded-2xl border border-volt/40 bg-carte p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="font-data text-xs uppercase tracking-[0.25em] text-volt">Vainqueur prédit par le modèle</p>
            <ScoreFloute libelle="Voir le vainqueur" className="mt-1">
              <span className="flex items-center gap-3">
                <Drapeau iso={equipeFavorite.iso} nom="Vainqueur prédit" taille="xl" />
                <span className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">{equipeFavorite.nomFr}</span>
              </span>
            </ScoreFloute>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
          <img src="/visuels/bd-coupe-volee.webp" alt="Le boss s'enfuit avec la coupe, poursuivi par les arbitres" width={150} height={150} className="hidden w-36 rounded-2xl sm:block" />
          <CompteurProba valeur={favori.titre} decimales={1} className="font-display text-5xl font-black text-volt sm:text-6xl" />
        </div>
      </section>

      <div data-reveal className="mt-6 overflow-x-auto rounded-2xl border border-ligne bg-carte">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">Probabilités de parcours par équipe</caption>
          <thead>
            <tr className="border-b border-ligne font-data text-xs uppercase tracking-wider text-brume">
              <th scope="col" className="px-4 py-3 text-left font-normal">Équipe</th>
              {COLONNES.map((colonne) => (
                <th key={colonne.clef} scope="col" className="px-3 py-3 text-right font-normal">
                  {colonne.libelle}
                </th>
              ))}
              <th scope="col" className="w-[26%] px-4 py-3 text-left font-normal">Course au titre</th>
            </tr>
          </thead>
          <tbody>
            {[favori, ...poursuivants].map((proba, rang) => {
              const equipe = equipes.get(proba.clef)!;
              return (
                <tr key={proba.clef} className="border-b border-ligne/60 transition-colors last:border-0 hover:bg-surface">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 font-data text-xs text-brume">{rang + 1}</span>
                      {rang === 0 ? (
                        <FlouBoss intensite="blur-[9px]" className="flex items-center gap-2.5">
                          <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="sm" />
                          <span className="font-medium">{equipe.nomFr}</span>
                        </FlouBoss>
                      ) : (
                        <>
                          <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="sm" />
                          <span className="font-medium">{equipe.nomFr}</span>
                        </>
                      )}
                    </span>
                  </td>
                  {COLONNES.map((colonne) => (
                    <td key={colonne.clef} className={`px-3 py-2.5 text-right font-data ${colonne.clef === "titre" ? "font-bold text-volt" : "text-brume"}`}>
                      {(proba[colonne.clef] * 100).toFixed(1)} %
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <BarreRemplie proportion={proba.titre / Math.max(favori.titre, 0.001)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p data-reveal className="mt-4 font-data text-xs text-brume">
        Dernier calcul : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(genereLe))}
      </p>
    </Apparition>
  );
}
