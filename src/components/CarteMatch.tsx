// Carte d'un match : affiche, prono score exact (flouté — boss only), barre 1·N·2.
// Toute la carte est cliquable (lien étiré) ; seul le bouton « voir le score »
// reprend la main sur le clic.

import Link from "next/link";
import type { MatchEnrichi } from "@/lib/service/pronostics";
import { confianceProno, COULEUR_CONFIANCE, heureFr, LIBELLE_PHASE } from "@/lib/ui/format";
import BarreTriple from "./anim/BarreTriple";
import Drapeau from "./Drapeau";
import ScoreFloute from "./ScoreFloute";

export default function CarteMatch({ match }: { match: MatchEnrichi }) {
  const { calendrier: m, domicile, exterieur, prevision, prono } = match;
  const sousTitre = m.groupe ? `Groupe ${m.groupe}` : LIBELLE_PHASE[m.phase];

  return (
    <article
      data-reveal
      className="group relative rounded-2xl border border-ligne bg-carte p-4 transition-colors duration-200 hover:border-volt/50 sm:p-5"
    >
      <Link
        href={`/match/${m.numero}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Détail du match ${domicile?.nomFr ?? m.placeholderDomicile ?? ""} – ${exterieur?.nomFr ?? m.placeholderExterieur ?? ""}`}
      />

      <div className="pointer-events-none relative z-10">
        <div className="flex items-center justify-between font-data text-xs text-brume">
          <span>
            {sousTitre} · {heureFr(m.dateUtc)}
          </span>
          <span className="hidden sm:inline">{m.stade}</span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <CoteEquipe nom={domicile?.nomFr ?? m.placeholderDomicile ?? "?"} drapeau={domicile?.drapeau} alignement="items-end text-right" />
          <Centre match={match} />
          <CoteEquipe nom={exterieur?.nomFr ?? m.placeholderExterieur ?? "?"} drapeau={exterieur?.drapeau} alignement="items-start text-left" />
        </div>

        {prevision && !m.joue && (
          <BarreTriple className="mt-4" probaA={prevision.probaA} probaNul={prevision.probaNul} probaB={prevision.probaB} />
        )}
        {prono && prevision && !m.joue && (
          <div className="mt-3 flex items-center justify-between">
            <span className="font-data text-xs text-brume">Bon résultat à {Math.round(prono.probaBonResultat * 100)} %</span>
            <ConfianceTag probaMax={Math.max(prevision.probaA, prevision.probaNul, prevision.probaB)} />
          </div>
        )}
      </div>
    </article>
  );
}

function CoteEquipe({ nom, drapeau, alignement }: { nom: string; drapeau?: string; alignement: string }) {
  return (
    <div className={`flex flex-col gap-1 ${alignement}`}>
      {drapeau && <Drapeau emoji={drapeau} nom={nom} />}
      <span className="font-display text-sm font-bold leading-tight sm:text-base">{nom}</span>
    </div>
  );
}

function Centre({ match }: { match: MatchEnrichi }) {
  const { calendrier: m, prono } = match;
  if (m.joue) {
    return (
      <div className="text-center">
        <span className="font-display text-4xl font-black tracking-tight text-craie sm:text-5xl">
          {m.butsDomicile}–{m.butsExterieur}
        </span>
        <span className="mt-1 block font-data text-[10px] uppercase tracking-widest text-volt">Terminé</span>
      </div>
    );
  }
  if (prono) {
    return (
      <div className="pointer-events-auto text-center">
        <ScoreFloute>
          <span className="font-display text-4xl font-black tracking-tight text-volt sm:text-5xl">
            {prono.butsA}–{prono.butsB}
          </span>
        </ScoreFloute>
        <span className="mt-1 block font-data text-[10px] uppercase tracking-widest text-brume">
          score exact à {(prono.proba * 100).toFixed(0)} %
        </span>
      </div>
    );
  }
  return <span className="text-center font-display text-2xl font-black text-brume">vs</span>;
}

function ConfianceTag({ probaMax }: { probaMax: number }) {
  const confiance = confianceProno(probaMax);
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-data text-[10px] uppercase tracking-wider ${COULEUR_CONFIANCE[confiance]}`}>
      {confiance}
    </span>
  );
}
