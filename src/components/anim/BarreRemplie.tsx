"use client";

// Barre horizontale qui se remplit à l'apparition (transform scaleX — pas de
// layout shift), largeur finale = proportion.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  proportion: number; // 0–1
  couleur?: string; // classe Tailwind du remplissage
  className?: string;
}

export default function BarreRemplie({ proportion, couleur = "bg-volt", className }: Props) {
  const piste = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-remplissage]", {
          scaleX: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: piste.current, start: "top 95%", once: true },
        });
      });
    },
    { scope: piste },
  );

  return (
    <div ref={piste} className={`h-1.5 overflow-hidden rounded-full bg-ligne ${className ?? ""}`}>
      <div
        data-remplissage
        className={`h-full origin-left rounded-full ${couleur}`}
        style={{ width: `${Math.max(0.5, proportion * 100)}%` }}
      />
    </div>
  );
}
