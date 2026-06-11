"use client";

// Révélation au scroll des éléments marqués [data-reveal] : montée + fondu,
// staggerées. Inerte si prefers-reduced-motion.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Apparition({ children, className }: { children: React.ReactNode; className?: string }) {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cibles = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        ScrollTrigger.batch(cibles, {
          start: "top 92%",
          once: true,
          onEnter: (lot) =>
            gsap.fromTo(
              lot,
              { y: 28, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", stagger: 0.07, overwrite: true },
            ),
        });
        // Les éléments déjà sous la ligne de flottaison partent invisibles.
        gsap.set(cibles, { opacity: 0 });
        ScrollTrigger.refresh();
      });
    },
    { scope: racine },
  );

  return (
    <div ref={racine} className={className}>
      {children}
    </div>
  );
}
