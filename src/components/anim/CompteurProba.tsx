"use client";

// Pourcentage qui « compte » jusqu'à sa valeur à l'apparition.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  valeur: number; // 0–1
  decimales?: number;
  className?: string;
}

export default function CompteurProba({ valeur, decimales = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const texteFinal = `${(valeur * 100).toFixed(decimales)} %`;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const etat = { v: 0 };
      gsap.to(etat, {
        v: valeur * 100,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 95%", once: true },
        onUpdate: () => {
          if (ref.current) ref.current.textContent = `${etat.v.toFixed(decimales)} %`;
        },
      });
    });
  }, [valeur, decimales]);

  return (
    <span ref={ref} className={className}>
      {texteFinal}
    </span>
  );
}
