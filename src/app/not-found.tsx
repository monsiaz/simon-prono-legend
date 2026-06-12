// 404 : cette page a pris un carton rouge.

import Link from "next/link";
import Vignette from "@/components/Vignette";

export default function PageIntrouvable() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <Vignette src="/visuels/bd-podium.webp" taille={220} className="w-52" />
      <h1 className="mt-6 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
        Hors-jeu<span className="text-volt">.</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-brume">
        Cette page n&apos;existe pas, ou alors le boss l&apos;a floutée tellement fort qu&apos;elle a disparu.
        Le podium, lui, est toujours là.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-volt px-6 py-3 font-data text-sm font-bold uppercase tracking-wider text-nuit transition-transform duration-200 hover:scale-105"
      >
        Retour aux matchs
      </Link>
    </div>
  );
}
