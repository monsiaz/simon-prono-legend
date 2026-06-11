"use client";

// Navigation : liens inline en desktop, burger plein écran en mobile.
// Le panneau s'ouvre en fondu + glissement, les liens arrivent en cascade.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

gsap.registerPlugin(useGSAP);

const LIENS = [
  { href: "/", label: "Matchs" },
  { href: "/groupes", label: "Groupes" },
  { href: "/tableau", label: "Tableau" },
  { href: "/cotes", label: "Cotes" },
  { href: "/buteurs", label: "Buteurs" },
  { href: "/actus", label: "Actus" },
  { href: "/methode", label: "Méthode" },
  { href: "/compte", label: "Mon compte" },
];

export default function Navigation() {
  const [ouvert, setOuvert] = useState(false);
  const panneau = useRef<HTMLDivElement>(null);
  const chemin = usePathname();

  // Verrouille le scroll de fond quand le panneau est ouvert.
  useEffect(() => {
    document.documentElement.style.overflow = ouvert ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ouvert]);

  useGSAP(
    () => {
      if (!ouvert || !panneau.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .fromTo(panneau.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" })
          .fromTo(
            "[data-lien-mobile]",
            { y: 26, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.05 },
            "<0.05",
          );
      });
    },
    { dependencies: [ouvert] },
  );

  const actif = (href: string) => (href === "/" ? chemin === "/" : chemin.startsWith(href));

  return (
    <>
      {/* Desktop */}
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Navigation principale">
        {LIENS.map((lien) => (
          <Link
            key={lien.href}
            href={lien.href}
            aria-current={actif(lien.href) ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              actif(lien.href) ? "bg-carte text-volt" : "text-brume hover:bg-carte hover:text-craie"
            }`}
          >
            {lien.label}
          </Link>
        ))}
      </nav>

      {/* Mobile : burger */}
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border border-ligne md:hidden"
      >
        <span className={`h-0.5 w-5 rounded bg-craie transition-transform duration-200 ${ouvert ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-5 rounded bg-craie transition-opacity duration-200 ${ouvert ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-5 rounded bg-craie transition-transform duration-200 ${ouvert ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {ouvert &&
        createPortal(
          // Portal : le backdrop-blur du header ferait sinon office de
          // containing block et écraserait ce panneau fixed.
          <div ref={panneau} className="fixed inset-0 top-[57px] z-40 bg-nuit md:hidden" role="dialog" aria-label="Menu">
          <nav className="terrain-filigrane flex h-full flex-col gap-1 overflow-y-auto px-6 py-8" aria-label="Navigation mobile">
            {LIENS.map((lien) => (
              <Link
                key={lien.href}
                data-lien-mobile
                href={lien.href}
                onClick={() => setOuvert(false)}
                aria-current={actif(lien.href) ? "page" : undefined}
                className={`rounded-2xl px-4 py-4 font-display text-2xl font-black uppercase tracking-tight transition-colors ${
                  actif(lien.href) ? "bg-carte text-volt" : "text-craie hover:bg-carte"
                }`}
              >
                {lien.label}
              </Link>
            ))}
          </nav>
        </div>,
          document.body,
        )}
    </>
  );
}
