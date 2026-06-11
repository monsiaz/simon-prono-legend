"use client";

// Heatmap des scorelines : P(score a–b) sur une grille 7×7, intensité volt.
// Les cellules se révèlent en vague depuis le 0–0.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TAILLE = 7; // scores 0 à 6 affichés (le reste est marginal)

interface Props {
  matrice: number[][];
  nomA: string;
  nomB: string;
}

export default function HeatmapScores({ matrice, nomA, nomB }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const maxProba = Math.max(...matrice.slice(0, TAILLE).flatMap((ligne) => ligne.slice(0, TAILLE)));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-cellule]", {
          opacity: 0,
          scale: 0.6,
          duration: 0.4,
          ease: "power2.out",
          stagger: { each: 0.012, grid: [TAILLE, TAILLE], from: "start" },
          scrollTrigger: { trigger: racine.current, start: "top 88%", once: true },
        });
      });
    },
    { scope: racine },
  );

  return (
    <div ref={racine}>
      <p className="mb-2 font-data text-xs text-brume">
        ↓ buts {nomA} · → buts {nomB} — plus c&apos;est clair, plus c&apos;est probable
      </p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${TAILLE}, minmax(0, 1fr))` }}>
        <span aria-hidden className="h-7" />
        {Array.from({ length: TAILLE }, (_, b) => (
          <span key={`tete-${b}`} className="flex h-7 items-center justify-center font-data text-xs text-brume">
            {b}
          </span>
        ))}
        {Array.from({ length: TAILLE }, (_, a) => (
          <Ligne key={a} a={a} matrice={matrice} maxProba={maxProba} nomA={nomA} nomB={nomB} />
        ))}
      </div>
    </div>
  );
}

function Ligne({ a, matrice, maxProba, nomA, nomB }: { a: number; matrice: number[][]; maxProba: number; nomA: string; nomB: string }) {
  return (
    <>
      <span className="flex items-center justify-center pr-1 font-data text-xs text-brume">{a}</span>
      {Array.from({ length: TAILLE }, (_, b) => {
        const proba = matrice[a]?.[b] ?? 0;
        const intensite = maxProba > 0 ? proba / maxProba : 0;
        return (
          <div
            key={b}
            data-cellule
            title={`${nomA} ${a} – ${b} ${nomB} : ${(proba * 100).toFixed(1)} %`}
            className="flex aspect-square items-center justify-center rounded-md font-data text-[10px] sm:text-xs"
            style={{
              backgroundColor: `color-mix(in oklab, var(--color-volt) ${Math.round(intensite * 88)}%, var(--color-carte))`,
              color: intensite > 0.55 ? "var(--color-nuit)" : "var(--color-brume)",
            }}
          >
            {proba >= 0.01 ? `${(proba * 100).toFixed(0)}` : ""}
          </div>
        );
      })}
    </>
  );
}
