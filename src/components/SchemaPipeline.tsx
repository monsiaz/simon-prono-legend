"use client";

// Le pipeline du modèle en un schéma animé : les étapes apparaissent en
// cascade, les connecteurs se dessinent entre elles.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ETAPES = [
  { chiffre: "37 312", libelle: "matchs internationaux", detail: "dataset ouvert CC0, 1980 → aujourd'hui" },
  { chiffre: "Elo", libelle: "ratings pondérés", detail: "enjeu + marge de buts, terrain +80" },
  { chiffre: "λ, ρ", libelle: "modèle de buts", detail: "Poisson bivarié, correction Dixon-Coles" },
  { chiffre: "10 000", libelle: "tournois simulés", detail: "conditionnés sur les résultats acquis" },
  { chiffre: "1 prono", libelle: "par match", detail: "l'espérance de points la plus haute" },
];

export default function SchemaPipeline() {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: racine.current, start: "top 80%", once: true } })
          .fromTo("[data-etape]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.18 })
          .fromTo(
            "[data-connecteur]",
            { scaleX: 0, scaleY: 0 },
            { scaleX: 1, scaleY: 1, duration: 0.3, ease: "power1.inOut", stagger: 0.18 },
            "<0.25",
          );
      });
    },
    { scope: racine },
  );

  return (
    <div ref={racine} className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
      {ETAPES.map((etape, i) => (
        <div key={etape.chiffre} className="flex flex-col items-center lg:flex-1 lg:flex-row">
          {i > 0 && (
            <span
              data-connecteur
              aria-hidden
              className="h-6 w-0.5 origin-top bg-volt/50 lg:h-0.5 lg:w-full lg:min-w-4 lg:origin-left"
            />
          )}
          <div data-etape className="w-full rounded-2xl border border-ligne bg-surface p-4 text-center lg:min-w-36">
            <p className="font-display text-2xl font-black text-volt">{etape.chiffre}</p>
            <p className="mt-1 font-data text-xs font-bold uppercase tracking-wider text-craie">{etape.libelle}</p>
            <p className="mt-1 text-xs leading-snug text-brume">{etape.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
