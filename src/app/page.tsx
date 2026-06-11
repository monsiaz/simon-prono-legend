// Accueil : hero vidéo, course au titre, buteurs en forme, tracking des
// pronos, puis tous les matchs groupés par journée.

import Link from "next/link";
import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import CompteurProba from "@/components/anim/CompteurProba";
import CarteMatch from "@/components/CarteMatch";
import Drapeau from "@/components/Drapeau";
import FlouBoss from "@/components/FlouBoss";
import TitreHero from "@/components/TitreHero";
import VideoLegende from "@/components/VideoLegende";
import buteursJson from "@/data/buteurs.json";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";
import { jourFr } from "@/lib/ui/format";

export const revalidate = 1800;

export default async function PageAccueil() {
  const { matchs, simulation, tracking } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const favoris = simulation.probas.filter((p) => equipes.has(p.clef)).slice(0, 5);
  const meilleureCote = favoris[0]?.titre ?? 1;
  const buteurs = buteursJson.buteurs.slice(0, 3);

  const parJour = new Map<string, typeof matchs>();
  for (const match of matchs) {
    const jour = jourFr(match.calendrier.dateUtc);
    parJour.set(jour, [...(parJour.get(jour) ?? []), match]);
  }
  const aujourdHui = jourFr(new Date().toISOString());

  return (
    <Apparition>
      <section className="terrain-filigrane border-b border-ligne">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto]">
          <div>
            <p data-reveal className="font-data text-xs uppercase tracking-[0.3em] text-volt">
              Coupe du Monde 2026 · 11 juin – 19 juillet
            </p>
            <TitreHero className="mt-3 max-w-3xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Le prono de chaque match,
              <span className="text-volt"> score exact compris.</span>
            </TitreHero>
            <p data-reveal className="mt-4 max-w-xl text-sm leading-relaxed text-brume sm:text-base">
              Un modèle maison fait les pronos : Elo pondéré, Poisson bivarié, 10 000 simulations Monte Carlo.
              Il se recalcule après chaque coup de sifflet final. Toi, tu profites.
            </p>
          </div>
          <div data-reveal className="lg:w-[300px]">
            <VideoLegende />
          </div>
        </div>
      </section>

      {tracking.joues > 0 && (
        <section className="border-b border-ligne bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
            <span className="font-data text-xs uppercase tracking-[0.25em] text-volt">Tracking du boss</span>
            <Stat valeur={tracking.joues} libelle={`prono${tracking.joues > 1 ? "s" : ""} jugé${tracking.joues > 1 ? "s" : ""}`} />
            <Stat valeur={tracking.exacts} libelle="scores exacts" accent="text-volt" />
            <Stat valeur={tracking.bonsResultats} libelle="bons résultats" accent="text-or" />
            <Stat valeur={tracking.perdus} libelle="perdus" accent="text-rouge" />
            <Stat valeur={tracking.points} libelle="points" accent="text-volt" />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div data-reveal className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-black uppercase tracking-tight">La course au titre</h2>
          <Link href="/cotes" className="font-data text-xs text-brume transition-colors hover:text-volt">
            Toutes les cotes →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {favoris.map((proba, rang) => {
            const equipe = equipes.get(proba.clef)!;
            const contenu = (
              <span className="flex items-center gap-2.5">
                <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="md" />
                <span className="text-sm font-bold leading-tight">{equipe.nomFr}</span>
              </span>
            );
            return (
              <div key={proba.clef} data-reveal className="rounded-2xl border border-ligne bg-carte p-4">
                <div className="flex items-center justify-between">
                  <span className="font-data text-xs text-brume">n°{rang + 1}</span>
                  <CompteurProba valeur={proba.titre} decimales={1} className="font-display text-xl font-black text-volt" />
                </div>
                <div className="mt-2.5">{rang === 0 ? <FlouBoss className="inline-flex">{contenu}</FlouBoss> : contenu}</div>
                <BarreRemplie className="mt-3" proportion={proba.titre / meilleureCote} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div data-reveal className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-black uppercase tracking-tight">Les buteurs en forme</h2>
          <Link href="/buteurs" className="font-data text-xs text-brume transition-colors hover:text-volt">
            Le classement complet →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {buteurs.map((buteur, rang) => {
            const equipe = equipes.get(buteur.equipe);
            return (
              <div key={buteur.nom} data-reveal className="flex items-center gap-4 rounded-2xl border border-ligne bg-carte p-4">
                <span className="font-display text-3xl font-black text-or">{rang + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{buteur.nom}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-data text-xs text-brume">
                    {equipe && <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="xs" />}
                    {equipe?.nomFr}
                  </p>
                </div>
                <span className="ml-auto text-right">
                  <span className="font-display text-2xl font-black text-volt">{buteur.buts}</span>
                  <span className="block font-data text-[10px] uppercase tracking-wider text-brume">buts depuis 2024</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {[...parJour.entries()].map(([jour, matchsDuJour]) => (
          <div key={jour} className="mb-10">
            <h2 data-reveal className="mb-4 flex flex-wrap items-baseline gap-3 font-display text-lg font-black uppercase tracking-tight">
              {jour}
              {jour === aujourdHui && (
                <span className="rounded-full bg-volt px-2.5 py-0.5 font-data text-[10px] font-bold uppercase tracking-wider text-nuit">
                  Aujourd&apos;hui
                </span>
              )}
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

function Stat({ valeur, libelle, accent }: { valeur: number; libelle: string; accent?: string }) {
  return (
    <span className="font-data text-sm text-brume">
      <strong className={accent ?? "text-craie"}>{valeur}</strong> {libelle}
    </span>
  );
}
