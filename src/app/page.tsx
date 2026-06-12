// Accueil : hero vidéo, course au titre, buteurs en forme, tracking des
// pronos, puis tous les matchs groupés par journée.

import Link from "next/link";
import Apparition from "@/components/anim/Apparition";
import BarreRemplie from "@/components/anim/BarreRemplie";
import CompteurProba from "@/components/anim/CompteurProba";
import CarteMatch from "@/components/CarteMatch";
import Drapeau from "@/components/Drapeau";
import FlouBoss from "@/components/FlouBoss";
import TableauDeChasse from "@/components/TableauDeChasse";
import TitreHero from "@/components/TitreHero";
import VideoLegende from "@/components/VideoLegende";
import Vignette from "@/components/Vignette";
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
      <section className="relative overflow-hidden border-b border-ligne">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/visuels/bd-stade-nuit.webp)" }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-nuit via-nuit/80 to-nuit/40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto]">
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
            <div data-reveal className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#matchs"
                className="rounded-full bg-volt px-6 py-3 font-data text-sm font-bold uppercase tracking-wider text-nuit transition-transform duration-200 hover:scale-105"
              >
                Les matchs du jour
              </a>
              <Link
                href="/compte"
                className="rounded-full border border-ligne px-6 py-3 font-data text-sm font-bold uppercase tracking-wider text-brume transition-colors duration-200 hover:border-volt/60 hover:text-volt"
              >
                Je suis le boss
              </Link>
            </div>
          </div>
          <div data-reveal className="lg:w-[300px]">
            <VideoLegende />
          </div>
        </div>
      </section>

      <TableauDeChasse
        juges={matchs.filter((m) => m.calendrier.joue && m.verdict).sort((a, b) => b.calendrier.numero - a.calendrier.numero)}
        tracking={tracking}
      />

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
            const masque = rang === 0;
            const contenu = (
              <span className="flex items-center gap-2.5">
                <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="lg" />
                <span className="text-sm font-bold leading-tight">{equipe.nomFr}</span>
              </span>
            );
            return (
              <div
                key={proba.clef}
                data-reveal
                className={`group relative overflow-hidden rounded-2xl border bg-carte p-4 transition-all duration-200 hover:-translate-y-1 ${
                  masque ? "border-volt/50" : "border-ligne hover:border-volt/30"
                }`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-4 font-display text-7xl font-black text-craie/5 transition-colors duration-300 group-hover:text-volt/10"
                >
                  {rang + 1}
                </span>
                {masque && (
                  <span className="font-data text-[10px] font-bold uppercase tracking-wider text-volt">Le pick du boss</span>
                )}
                {!masque && <span className="font-data text-[10px] uppercase tracking-wider text-brume">n°{rang + 1}</span>}
                <div className="mt-2.5">{masque ? <FlouBoss className="inline-flex">{contenu}</FlouBoss> : contenu}</div>
                <CompteurProba
                  valeur={proba.titre}
                  decimales={1}
                  className="mt-3 block font-display text-3xl font-black leading-none text-volt"
                />
                <span className="font-data text-[10px] uppercase tracking-wider text-brume">de titres simulés</span>
                <BarreRemplie className="mt-2.5" proportion={proba.titre / meilleureCote} />
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

      <section id="matchs" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {[...parJour.entries()].map(([jour, matchsDuJour]) => (
          <div key={jour} className="mb-10">
            <h2 data-reveal className="mb-4 flex flex-wrap items-baseline gap-3 font-display text-lg font-black uppercase tracking-tight">
              {jour}
              {jour === aujourdHui && (
                <span className="rounded-full bg-volt px-2.5 py-0.5 font-data text-[10px] font-bold uppercase tracking-wider text-nuit motion-safe:animate-pulse">
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

      <section className="border-t border-ligne">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 sm:flex-row sm:text-left">
          <Vignette src="/visuels/bd-supporters.webp" taille={160} className="w-36 sm:w-40" />
          <div>
            <h2 data-reveal className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
              T&apos;as scrollé jusqu&apos;ici ?<span className="text-volt"> Le boss valide.</span>
            </h2>
            <p data-reveal className="mt-2 max-w-lg text-sm text-brume">
              104 matchs, 10 000 simulations, un seul boss. Va voir qui soulève la coupe d&apos;après le modèle.
              Enfin… presque.
            </p>
            <Link
              href="/cotes"
              data-reveal
              className="mt-5 inline-block rounded-full bg-volt px-6 py-3 font-data text-sm font-bold uppercase tracking-wider text-nuit transition-transform duration-200 hover:scale-105"
            >
              Voir les cotes du titre
            </Link>
          </div>
        </div>
      </section>
    </Apparition>
  );
}
