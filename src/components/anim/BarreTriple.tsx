"use client";

// Barre 1·N·2 : trois segments proportionnels aux probabilités, remplis en
// cascade. En mode floutable (match à venir, visiteur non connecté), les
// segments s'égalisent et les pourcentages se masquent : la barre ne vend
// plus le vainqueur. Le boss connecté voit les vraies valeurs.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useBoss } from "@/lib/auth/useBoss";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  probaA: number;
  probaNul: number;
  probaB: number;
  className?: string;
  floutable?: boolean; // masque les valeurs pour les non-boss
}

const SEGMENTS = [
  { clef: "A", couleur: "bg-volt" },
  { clef: "N", couleur: "bg-brume" },
  { clef: "B", couleur: "bg-or" },
] as const;

export default function BarreTriple({ probaA, probaNul, probaB, className, floutable = false }: Props) {
  const boss = useBoss();
  const masque = floutable && !boss;
  const racine = useRef<HTMLDivElement>(null);
  const valeurs = masque ? [1 / 3, 1 / 3, 1 / 3] : [probaA, probaNul, probaB];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-segment]", {
          scaleX: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: racine.current, start: "top 95%", once: true },
        });
      });
    },
    { scope: racine, dependencies: [masque] },
  );

  return (
    <div ref={racine} className={className}>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {SEGMENTS.map((segment, i) => (
          <div key={segment.clef} className="h-full rounded-full bg-ligne" style={{ width: `${valeurs[i] * 100}%` }}>
            <div data-segment className={`h-full origin-left rounded-full ${masque ? "bg-brume/30" : segment.couleur}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-data text-[11px] text-brume">
        {masque ? (
          <>
            <span>1 <strong className="select-none blur-[5px]" aria-hidden>{Math.round(probaA * 7919) % 90} %</strong></span>
            <span className="uppercase tracking-wider" title="Réservé au boss du game">probas du boss 🤫</span>
            <span>2 <strong className="select-none blur-[5px]" aria-hidden>{Math.round(probaB * 6151) % 90} %</strong></span>
          </>
        ) : (
          <>
            <span>
              1 <strong className="text-craie">{Math.round(probaA * 100)} %</strong>
            </span>
            <span>
              N <strong className="text-craie">{Math.round(probaNul * 100)} %</strong>
            </span>
            <span>
              2 <strong className="text-craie">{Math.round(probaB * 100)} %</strong>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
