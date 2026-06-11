import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Wordmark from "@/components/Wordmark";
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
    "Ici, on ne rêve pas : on prédit. Pronostics statistiques de la Coupe du Monde 2026 : probabilités, scores exacts (réservés au boss) et cotes de titre, recalculés après chaque match. Modèle Elo + Poisson bivarié calibré sur 37 000 matchs internationaux.",
  openGraph: {
    title: "Simon Prono Legend",
    description: "Ici, on ne rêve pas : on prédit. Les pronos de légende de la Coupe du Monde 2026.",
    images: [{ url: "/visuels/og.jpg", width: 1200, height: 800 }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-ligne bg-nuit/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
              <img
                src="/visuels/logo-embleme.webp"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 rounded-lg transition-transform duration-200 group-hover:-rotate-6 sm:h-10 sm:w-10"
              />
              <Wordmark compact />
            </Link>
            <Navigation />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ligne">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-brume sm:px-6">
            <p>
              Modèle statistique maison : Elo pondéré + Poisson bivarié (correction Dixon-Coles) + Monte Carlo,
              calibré sur 37 000 matchs internationaux. Ratings recalculés après chaque match du Mondial.
            </p>
            <p>Des probabilités, pas des certitudes. Aucun lien avec un opérateur de paris.</p>
            <p className="mt-2 border-t border-ligne pt-3 text-craie">
              Fait avec amour par <strong>Simon Azoulay</strong>, le boss du game ·{" "}
              <a
                href="https://github.com/monsiaz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-volt underline underline-offset-2 hover:text-craie"
              >
                github.com/monsiaz
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
