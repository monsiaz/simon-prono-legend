"use client";

// Le score exact est flouté. Le bouton ouvre la popup « boss du game » —
// entrée élastique, emoji qui salue, sortie rapide.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBoss } from "@/lib/auth/useBoss";

gsap.registerPlugin(useGSAP);

interface Props {
  children: React.ReactNode;
  className?: string;
  libelle?: string;
  // Affiché sous le flou à la place du vrai contenu : même en plissant les
  // yeux (ou en zoomant), on ne voit qu'un faux score.
  leurre?: React.ReactNode;
}

export default function ScoreFloute({ children, className, libelle = "Voir le score", leurre }: Props) {
  const boss = useBoss();
  const [ouverte, setOuverte] = useState(false);
  const racine = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: racine });

  const ouvrir = contextSafe((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOuverte(true);
  });

  // eslint-disable-next-line react-hooks/refs -- le ref n'est lu qu'à l'exécution du gestionnaire, pas au rendu (pattern contextSafe GSAP)
  const fermer = contextSafe((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit || !popup.current) {
      setOuverte(false);
      return;
    }
    gsap.to(popup.current, {
      scale: 0.85,
      opacity: 0,
      y: 14,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => setOuverte(false),
    });
  });

  useGSAP(
    () => {
      if (!ouverte) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .fromTo("[data-voile]", { opacity: 0 }, { opacity: 1, duration: 0.2 })
          .fromTo(
            popup.current,
            { scale: 0.6, opacity: 0, y: 24 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(2.2)" },
            "<0.05",
          )
          .fromTo("[data-coucou]", { rotate: 0 }, { rotate: 24, duration: 0.18, repeat: 5, yoyo: true, ease: "power1.inOut" }, "-=0.1");
      });
    },
    { dependencies: [ouverte] },
  );

  if (boss) {
    return <span className={`inline-block ${className ?? ""}`}>{children}</span>;
  }

  return (
    <span ref={racine} className={`relative inline-block ${className ?? ""}`}>
      <span aria-hidden className="pointer-events-none select-none overflow-hidden blur-[14px] saturate-50">
        {leurre ?? children}
      </span>
      <button
        type="button"
        onClick={ouvrir}
        className="absolute inset-0 flex cursor-pointer items-center justify-center"
        aria-label={libelle}
      >
        <span className="whitespace-nowrap rounded-full border border-volt/50 bg-nuit/85 px-3.5 py-1.5 font-data text-[10px] font-bold uppercase tracking-widest text-volt transition-all duration-200 hover:scale-105 hover:bg-volt hover:text-nuit">
          {libelle}
        </span>
      </button>

      {ouverte &&
        createPortal(
        <div
          data-voile
          role="dialog"
          aria-modal="true"
          aria-label="Score réservé"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-nuit/90 p-4"
          onClick={fermer}
        >
          <div
            ref={popup}
            className="terrain-filigrane w-full max-w-sm rounded-3xl border border-volt/40 bg-carte p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
            <img data-coucou src="/visuels/bd-pouce.webp" alt="" width={132} height={132} className="mx-auto h-32 w-32 rounded-2xl" />
            <p className="mt-4 font-display text-2xl font-black uppercase leading-tight tracking-tight">
              Seul le <span className="text-volt">boss du game</span> peut voir le score
            </p>
            <p className="mt-2 font-data text-sm text-brume">Bye bye :)</p>
            <button
              type="button"
              onClick={fermer}
              className="mt-6 cursor-pointer rounded-full bg-volt px-6 py-2.5 font-data text-sm font-bold uppercase tracking-wider text-nuit transition-transform duration-200 hover:scale-105"
            >
              Compris
            </button>
            <p className="mt-4">
              <Link href="/compte" className="font-data text-xs text-brume underline-offset-2 hover:text-volt hover:underline">
                Je suis le boss → me connecter
              </Link>
            </p>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
