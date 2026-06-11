"use client";

// La vidéo légendaire du hero — SON PAR DÉFAUT, autant que les navigateurs le
// permettent : on tente l'autoplay avec son ; s'il est bloqué (politique
// Chrome/Safari), le son s'active tout seul au premier geste de l'utilisateur
// (clic, touche, scroll). Bouton pour couper/remettre.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

export default function VideoLegende() {
  const video = useRef<HTMLVideoElement>(null);
  const racine = useRef<HTMLDivElement>(null);
  const [sonActif, setSonActif] = useState(false);
  const coupeVolontairement = useRef(false);

  // Tentative de démarrage avec son ; fallback muet + unmute au premier geste.
  useEffect(() => {
    const v = video.current;
    if (!v) return;

    v.muted = false;
    v.volume = 1;
    const tentative = v.play();

    let nettoyer = () => {};
    tentative
      .then(() => setSonActif(true))
      .catch(() => {
        // Autoplay sonore refusé : on démarre muet, et on monte le son au
        // tout premier geste utilisateur sur la page.
        v.muted = true;
        void v.play();
        const activerSon = () => {
          if (coupeVolontairement.current || !video.current) return;
          video.current.muted = false;
          video.current.currentTime = 0;
          void video.current.play();
          setSonActif(true);
        };
        const evenements: (keyof DocumentEventMap)[] = ["pointerdown", "keydown", "touchstart", "wheel"];
        evenements.forEach((e) => document.addEventListener(e, activerSon, { once: true, passive: true }));
        nettoyer = () => evenements.forEach((e) => document.removeEventListener(e, activerSon));
      });
    return () => nettoyer();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-pulse]", { scale: 1.06, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },
    { scope: racine },
  );

  const basculerSon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video.current) return;
    const prochainEtat = !sonActif;
    coupeVolontairement.current = !prochainEtat;
    video.current.muted = !prochainEtat;
    if (prochainEtat) void video.current.play();
    setSonActif(prochainEtat);
  };

  return (
    <div ref={racine} className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      <div className="overflow-hidden rounded-3xl border border-volt/30 shadow-[0_0_60px_-15px_var(--color-volt)]">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- clip d'ambiance */}
        <video
          ref={video}
          src="/simon-prono-legend.mp4"
          poster="/simon-prono-legend-poster.jpg"
          autoPlay
          loop
          playsInline
          className="aspect-[9/16] w-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={basculerSon}
        data-pulse
        className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded-full border border-volt/60 bg-nuit/85 px-4 py-2.5 font-data text-xs font-bold uppercase tracking-wider text-volt transition-colors duration-200 hover:bg-volt hover:text-nuit"
        aria-pressed={sonActif}
      >
        {sonActif ? "🔇 Couper le son" : "🔊 Mettre le son"}
      </button>
    </div>
  );
}
