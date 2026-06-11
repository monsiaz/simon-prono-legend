"use client";

// Le wordmark « SIMON PRONO LEGEND » : trois mots, trois traitements, lettres
// qui montent en cascade au chargement.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

export default function Wordmark({ compact = false }: { compact?: boolean }) {
  const racine = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const decoupe = SplitText.create("[data-mot]", { type: "chars" });
        gsap.from(decoupe.chars, {
          y: 14,
          opacity: 0,
          rotate: 6,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.025,
        });
      });
    },
    { scope: racine },
  );

  const base = compact ? "text-base sm:text-lg" : "text-2xl sm:text-3xl";
  return (
    <span ref={racine} className={`inline-flex items-baseline gap-1.5 font-display font-black uppercase leading-none tracking-tight ${base}`}>
      <span data-mot className="text-craie">
        Simon
      </span>
      <span data-mot className="text-volt">
        Prono
      </span>
      <span data-mot className="-skew-x-6 text-or">
        Legend
      </span>
    </span>
  );
}
