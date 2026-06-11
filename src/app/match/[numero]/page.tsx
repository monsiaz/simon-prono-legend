// Détail d'un match : probabilités, heatmap des scores, top 5, prono conseillé.

import Link from "next/link";
import { notFound } from "next/navigation";
import Apparition from "@/components/anim/Apparition";
import BarreTriple from "@/components/anim/BarreTriple";
import Drapeau from "@/components/Drapeau";
import HeatmapScores from "@/components/HeatmapScores";
import ScoreFloute from "@/components/ScoreFloute";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics, type MatchEnrichi } from "@/lib/service/pronostics";
import { heureFr, jourFr, LIBELLE_PHASE } from "@/lib/ui/format";

export const revalidate = 1800;

export function generateStaticParams() {
  return Array.from({ length: 104 }, (_, i) => ({ numero: String(i + 1) }));
}

export default async function PageMatch({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const { matchs, simulation, elosLive } = await chargerPronostics();
  const match = matchs.find((m) => m.calendrier.numero === Number(numero));
  if (!match) notFound();

  const { calendrier: m, domicile, exterieur, prevision, scoresProbables, prono } = match;

  return (
    <Apparition className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/" data-reveal className="font-data text-xs text-brume transition-colors hover:text-craie">
        ← Tous les matchs
      </Link>

      <header data-reveal className="mt-4 rounded-2xl border border-ligne bg-carte p-6 terrain-filigrane sm:p-8">
        <p className="font-data text-xs uppercase tracking-[0.25em] text-volt">
          {m.groupe ? `Groupe ${m.groupe}` : LIBELLE_PHASE[m.phase]} · Match {m.numero}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Cote equipe={domicile} placeholder={m.placeholderDomicile} elo={domicile ? elosLive.get(domicile.clef) : undefined} alignement="text-right" />
          <ScoreCentral match={match} />
          <Cote equipe={exterieur} placeholder={m.placeholderExterieur} elo={exterieur ? elosLive.get(exterieur.clef) : undefined} alignement="text-left" />
        </div>
        <p className="mt-5 text-center font-data text-xs text-brume">
          {jourFr(m.dateUtc)} · {heureFr(m.dateUtc)} (Paris) · {m.stade}
        </p>
      </header>

      {prevision && (
        <section data-reveal className="mt-6 rounded-2xl border border-ligne bg-carte p-6">
          <h2 className="font-display text-base font-black uppercase tracking-tight">Issue du match</h2>
          <BarreTriple className="mt-4" probaA={prevision.probaA} probaNul={prevision.probaNul} probaB={prevision.probaB} />
          <p className="mt-4 font-data text-xs text-brume">
            Buts attendus : {domicile?.nomFr} {prevision.lambdaA.toFixed(2)} · {exterieur?.nomFr} {prevision.lambdaB.toFixed(2)}
          </p>
        </section>
      )}

      {prono && prevision && (
        <section data-reveal className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-volt/40 bg-carte p-6">
            <h2 className="font-display text-base font-black uppercase tracking-tight text-volt">Prono conseillé</h2>
            <div className="mt-3">
              <ScoreFloute>
                <span className="font-display text-6xl font-black tracking-tight">
                  {prono.butsA}–{prono.butsB}
                </span>
              </ScoreFloute>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brume">
              Score exact à <strong className="text-craie">{(prono.proba * 100).toFixed(1)} %</strong>, bon résultat à{" "}
              <strong className="text-craie">{(prono.probaBonResultat * 100).toFixed(0)} %</strong>. C&apos;est le pronostic qui
              maximise l&apos;espérance de points (barème 3 pts score exact / 1 pt bon résultat).
            </p>
          </div>
          <div className="rounded-2xl border border-ligne bg-carte p-6">
            <h2 className="font-display text-base font-black uppercase tracking-tight">Scores les plus probables</h2>
            <ol className="mt-3 space-y-2">
              {scoresProbables.map((score, i) => (
                <li key={`${score.butsA}-${score.butsB}`} className="flex items-center justify-between font-data text-sm">
                  <span aria-hidden className={`select-none blur-[7px] ${i === 0 ? "font-bold text-craie" : "text-brume"}`}>
                    {score.butsA}–{score.butsB}
                  </span>
                  <span className={i === 0 ? "font-bold text-volt" : "text-brume"}>{(score.proba * 100).toFixed(1)} %</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {prevision && domicile && exterieur && (
        <section data-reveal className="mt-6 rounded-2xl border border-ligne bg-carte p-6">
          <h2 className="mb-4 font-display text-base font-black uppercase tracking-tight">Tous les scores</h2>
          <HeatmapScores matrice={prevision.matrice} nomA={domicile.nomFr} nomB={exterieur.nomFr} />
        </section>
      )}

      {!prevision && <AdversairesProbables match={match} apparitions={simulation.apparitions} nSims={simulation.nSims} />}
    </Apparition>
  );
}

function Cote({ equipe, placeholder, elo, alignement }: { equipe: ReturnType<typeof toutesLesEquipes>[number] | null; placeholder: string | null; elo?: number; alignement: string }) {
  if (!equipe) {
    return <p className={`font-display text-lg font-bold text-brume ${alignement}`}>{placeholder === "To be announced" ? "À déterminer" : placeholder}</p>;
  }
  return (
    <div className={`flex flex-col gap-1.5 ${alignement}`}>
      <Drapeau emoji={equipe.drapeau} nom={equipe.nomFr} taille="text-4xl" />
      <span className="font-display text-xl font-black leading-tight sm:text-2xl">{equipe.nomFr}</span>
      {elo && <span className="font-data text-xs text-brume">Elo {Math.round(elo)}</span>}
    </div>
  );
}

function ScoreCentral({ match }: { match: MatchEnrichi }) {
  const { calendrier: m } = match;
  if (m.joue) {
    return (
      <div className="text-center">
        <span className="font-display text-5xl font-black sm:text-7xl">
          {m.butsDomicile}–{m.butsExterieur}
        </span>
        <span className="mt-2 block font-data text-[10px] uppercase tracking-widest text-volt">Terminé</span>
      </div>
    );
  }
  return <span className="text-center font-display text-3xl font-black text-brume">vs</span>;
}

function AdversairesProbables({ match, apparitions, nSims }: { match: MatchEnrichi; apparitions: Map<number, Map<string, number>>; nSims: number }) {
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const compteurs = apparitions.get(match.calendrier.numero);
  if (!compteurs) return null;
  const probables = [...compteurs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <section data-reveal className="mt-6 rounded-2xl border border-ligne bg-carte p-6">
      <h2 className="font-display text-base font-black uppercase tracking-tight">Affiche probable</h2>
      <p className="mt-1 font-data text-xs text-brume">Fréquence d&apos;apparition dans ce match sur {nSims.toLocaleString("fr-FR")} simulations</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {probables.map(([clef, compte]) => {
          const equipe = equipes.get(clef);
          if (!equipe) return null;
          return (
            <li key={clef} className="flex items-center justify-between rounded-xl border border-ligne px-3 py-2">
              <span className="flex items-center gap-2 text-sm">
                <Drapeau emoji={equipe.drapeau} nom={equipe.nomFr} taille="text-lg" />
                {equipe.nomFr}
              </span>
              <span className="font-data text-sm text-volt">{((compte / nSims) * 100).toFixed(0)} %</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
