"use client";

// Barre 1·N·2 : trois segments proportionnels aux probabilités, remplis en
// cascade à l'apparition.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  probaA: number;
  probaNul: number;
  probaB: number;
  className?: string;
}

const SEGMENTS = [
  { clef: "A", couleur: "bg-volt" },
  { clef: "N", couleur: "bg-brume" },
  { clef: "B", couleur: "bg-or" },
] as const;

export default function BarreTriple({ probaA, probaNul, probaB, className }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const valeurs = [probaA, probaNul, probaB];

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
    { scope: racine },
  );

  return (
    <div ref={racine} className={className}>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {SEGMENTS.map((segment, i) => (
          <div key={segment.clef} className="h-full rounded-full bg-ligne" style={{ width: `${valeurs[i] * 100}%` }}>
            <div data-segment className={`h-full origin-left rounded-full ${segment.couleur}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-data text-[11px] text-brume">
        <span>
          1 <strong className="text-craie">{Math.round(probaA * 100)} %</strong>
        </span>
        <span>
          N <strong className="text-craie">{Math.round(probaNul * 100)} %</strong>
        </span>
        <span>
          2 <strong className="text-craie">{Math.round(probaB * 100)} %</strong>
        </span>
      </div>
    </div>
  );
}
