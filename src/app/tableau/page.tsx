// Le tableau final : des 32es à la finale, affiches réelles quand elles sont
// connues, affiches probables (fréquence Monte Carlo) sinon. Les vainqueurs
// prédits, eux, restent le secret du boss.

import Apparition from "@/components/anim/Apparition";
import Drapeau from "@/components/Drapeau";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics, type MatchEnrichi } from "@/lib/service/pronostics";
import { heureFr, jourFr, LIBELLE_PHASE } from "@/lib/ui/format";
import Link from "next/link";
import type { Phase } from "@/lib/data/calendrier";

export const revalidate = 1800;

export const metadata = {
  title: "Le tableau final — Simon Prono Legend",
  description: "Des 32es de finale à la finale : affiches connues et affiches probables selon 10 000 simulations.",
};

const ORDRE_PHASES: Phase[] = ["32es", "8es", "quarts", "demies", "petite-finale", "finale"];

export default async function PageTableau() {
  const { matchs, simulation } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));
  const parPhase = new Map<Phase, MatchEnrichi[]>();
  for (const match of matchs) {
    const phase = match.calendrier.phase;
    if (phase === "groupes") continue;
    parPhase.set(phase, [...(parPhase.get(phase) ?? []), match]);
  }

  return (
    <Apparition className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 data-reveal className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Le tableau final<span className="text-volt">.</span>
      </h1>
      <p data-reveal className="mt-2 max-w-2xl text-sm text-brume">
        Tant qu&apos;une affiche n&apos;est pas officielle, on montre les deux équipes les plus fréquentes à ce stade du
        tableau sur {simulation.nSims.toLocaleString("fr-FR")} simulations — et leur probabilité d&apos;y être.
      </p>

      <div className="mt-8 space-y-10">
        {ORDRE_PHASES.map((phase) => {
          const matchsPhase = parPhase.get(phase);
          if (!matchsPhase?.length) return null;
          return (
            <section key={phase}>
              <h2 data-reveal className="mb-4 font-display text-lg font-black uppercase tracking-tight">
                {LIBELLE_PHASE[phase]}
                <span className="ml-2 font-data text-xs font-normal normal-case text-brume">{matchsPhase.length} match{matchsPhase.length > 1 ? "s" : ""}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {matchsPhase.map((match) => (
                  <CarteTableau key={match.calendrier.numero} match={match} apparitions={simulation.apparitions} nSims={simulation.nSims} equipes={equipes} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Apparition>
  );
}

type Equipes = Map<string, ReturnType<typeof toutesLesEquipes>[number]>;

function CarteTableau({ match, apparitions, nSims, equipes }: { match: MatchEnrichi; apparitions: Map<number, Map<string, number>>; nSims: number; equipes: Equipes }) {
  const { calendrier: m, domicile, exterieur } = match;
  return (
    <Link
      href={`/match/${m.numero}`}
      data-reveal
      className="block rounded-2xl border border-ligne bg-carte p-4 transition-colors duration-200 hover:border-volt/50"
    >
      <p className="font-data text-[10px] uppercase tracking-wider text-brume">
        M{m.numero} · {jourFr(m.dateUtc)} · {heureFr(m.dateUtc)}
      </p>
      <div className="mt-3 space-y-2">
        {domicile && exterieur ? (
          <>
            <LigneEquipe nom={domicile.nomFr} iso={domicile.iso} />
            <LigneEquipe nom={exterieur.nomFr} iso={exterieur.iso} />
          </>
        ) : (
          <AffichesProbables numero={m.numero} apparitions={apparitions} nSims={nSims} equipes={equipes} placeholders={[m.placeholderDomicile, m.placeholderExterieur]} />
        )}
      </div>
    </Link>
  );
}

function LigneEquipe({ nom, iso, detail }: { nom: string; iso: string; detail?: string }) {
  return (
    <p className="flex items-center justify-between gap-2 text-sm font-medium">
      <span className="flex items-center gap-2">
        <Drapeau iso={iso} nom={nom} taille="sm" />
        {nom}
      </span>
      {detail && <span className="font-data text-xs text-volt">{detail}</span>}
    </p>
  );
}

function AffichesProbables({ numero, apparitions, nSims, equipes, placeholders }: { numero: number; apparitions: Map<number, Map<string, number>>; nSims: number; equipes: Equipes; placeholders: (string | null)[] }) {
  const compteurs = apparitions.get(numero);
  if (!compteurs) {
    return <p className="font-data text-sm text-brume">{placeholders.filter(Boolean).join(" vs ") || "À déterminer"}</p>;
  }
  const probables = [...compteurs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
  return (
    <>
      {probables.map(([clef, compte]) => {
        const equipe = equipes.get(clef);
        if (!equipe) return null;
        return <LigneEquipe key={clef} nom={equipe.nomFr} iso={equipe.iso} detail={`${Math.round((compte / nSims) * 100)} %`} />;
      })}
      <p className="font-data text-[10px] text-brume">affiche la plus probable</p>
    </>
  );
}
