// Le tableau de chasse du boss : chaque prono jugé, ce qui avait été dit,
// ce qui s'est passé. Visible par tout le monde : les victoires se montrent.

import Link from "next/link";
import type { MatchEnrichi, TrackingPronos } from "@/lib/service/pronostics";
import { COULEUR_VERDICT, LIBELLE_VERDICT } from "@/lib/ui/verdict";
import Drapeau from "./Drapeau";
import Vignette from "./Vignette";

interface Props {
  juges: MatchEnrichi[]; // matchs joués avec prono, du plus récent au plus ancien
  tracking: TrackingPronos;
}

function phraseBoss(tracking: TrackingPronos): string {
  if (tracking.exacts > 0 && tracking.perdus === 0) return "Le boss ne rate jamais. Prenez des notes.";
  if (tracking.exacts > 0) return "Des scores exacts au compteur. Normal, c'est le boss.";
  if (tracking.perdus === 0) return "Aucun prono perdu. Le boss voit loin.";
  if (tracking.bonsResultats + tracking.exacts >= tracking.perdus) return "Le boss reste devant. Évidemment.";
  return "Période de turbulences. Le boss appelle ça « de la variance ».";
}

export default function TableauDeChasse({ juges, tracking }: Props) {
  if (juges.length === 0) return null;
  return (
    <section className="border-b border-ligne bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div data-reveal className="flex items-center gap-4">
          {tracking.exacts > 0 && <Vignette src="/visuels/bd-medaille.webp" taille={72} className="w-16 sm:w-[72px]" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-black uppercase tracking-tight">
                Le tableau de chasse<span className="text-volt">.</span>
              </h2>
              <p className="font-data text-xs text-brume">{phraseBoss(tracking)}</p>
            </div>
          </div>
        </div>

        <div data-reveal className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-data text-sm text-brume">
          <span>
            <strong className="text-volt">{tracking.exacts}</strong> dans le mille
          </span>
          <span>
            <strong className="text-or">{tracking.bonsResultats}</strong> bon{tracking.bonsResultats > 1 ? "s" : ""} call{tracking.bonsResultats > 1 ? "s" : ""}
          </span>
          <span>
            <strong className="text-rouge">{tracking.perdus}</strong> à côté
          </span>
          <span>
            <strong className="text-craie">{tracking.points}</strong> point{tracking.points > 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {juges.slice(0, 6).map((match) => {
            const { calendrier: m, domicile, exterieur, prono, verdict } = match;
            if (!domicile || !exterieur || !prono || !verdict) return null;
            return (
              <Link
                key={m.numero}
                href={`/match/${m.numero}`}
                data-reveal
                className={`group rounded-2xl border bg-carte p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  verdict === "exact" ? "border-volt/50" : verdict === "resultat" ? "border-or/40" : "border-ligne"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                    <Drapeau iso={domicile.iso} nom={domicile.nomFr} taille="xs" />
                    <span className="truncate">{domicile.nomFr}</span>
                    <span className="text-brume">·</span>
                    <Drapeau iso={exterieur.iso} nom={exterieur.nomFr} taille="xs" />
                    <span className="truncate">{exterieur.nomFr}</span>
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="font-data text-xs leading-relaxed text-brume">
                    <p>
                      Prono du boss : <strong className="text-craie">{prono.butsA}–{prono.butsB}</strong>
                    </p>
                    <p>
                      Score final : <strong className="text-craie">{m.butsDomicile}–{m.butsExterieur}</strong>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 font-data text-[10px] font-bold uppercase tracking-wider ${COULEUR_VERDICT[verdict]}`}>
                    {LIBELLE_VERDICT[verdict]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
