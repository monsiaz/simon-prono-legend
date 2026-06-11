"use client";

// Titre du hero : les mots se révèlent en glissant depuis le bas de leur
// ligne, masqués pendant la course. Même famille d'effet que le wordmark.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

export default function TitreHero({ children, className }: { children: React.ReactNode; className?: string }) {
  const racine = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const decoupe = SplitText.create(racine.current, { type: "words", mask: "words" });
        gsap.from(decoupe.words, {
          yPercent: 110,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
          delay: 0.1,
        });
      });
    },
    { scope: racine },
  );

  return (
    <h1 ref={racine} className={className}>
      {children}
    </h1>
  );
}
