import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simon-prono-legend.vercel.app"),
  title: "Simon Prono Legend — Pronostics Coupe du Monde 2026",
  description:
    "Ici, on ne rêve pas : on prédit. Pronostics statistiques de la Coupe du Monde 2026 — probabilités, scores exacts (réservés au boss) et cotes de titre, recalculés après chaque match. Modèle Elo + Poisson bivarié calibré sur 37 000 matchs internationaux.",
  openGraph: {
    title: "Simon Prono Legend",
    description: "Ici, on ne rêve pas : on prédit. Les pronos de légende de la Coupe du Monde 2026.",
    images: [{ url: "/visuels/og.jpg", width: 1200, height: 800 }],
    locale: "fr_FR",
    type: "website",
  },
};

const LIENS = [
  { href: "/", label: "Matchs" },
  { href: "/groupes", label: "Groupes" },
  { href: "/tableau", label: "Tableau" },
  { href: "/cotes", label: "Cotes" },
  { href: "/actus", label: "Actus" },
  { href: "/methode", label: "Méthode" },
  { href: "/compte", label: "Mon compte" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-ligne bg-nuit/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Simon Prono Legend — accueil">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
              <img
                src="/visuels/logo-embleme.webp"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 rounded-lg transition-transform duration-200 group-hover:-rotate-6 sm:h-10 sm:w-10"
              />
              <span className="font-display text-base font-black uppercase leading-none tracking-tight text-craie sm:text-lg">
                Simon <span className="text-volt">Prono</span> Legend
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-0.5" aria-label="Navigation principale">
              {LIENS.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="rounded-full px-2.5 py-2 text-xs font-medium text-brume transition-colors duration-200 hover:bg-carte hover:text-craie sm:px-3.5 sm:text-sm"
                >
                  {lien.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ligne">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-brume sm:px-6">
            <p>
              Modèle statistique maison : Elo pondéré + Poisson bivarié (correction Dixon-Coles) + Monte Carlo,
              calibré sur 37 000 matchs internationaux. Ratings recalculés après chaque match du Mondial.
            </p>
            <p>Probabilités, pas certitudes — aucun lien avec un opérateur de paris.</p>
            <p className="mt-2 border-t border-ligne pt-3 text-craie">
              Outil conçu et calibré par <strong>Simon Azoulay</strong> · GraciaMedia — le boss du game.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
