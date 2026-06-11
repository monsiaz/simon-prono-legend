"use client";

// Flou levé pour le boss connecté — pour les éléments masqués sans popup
// (strip des favoris, ligne 1 des cotes, liste des scores probables).

import { useBoss } from "@/lib/auth/useBoss";

interface Props {
  children: React.ReactNode;
  className?: string;
  intensite?: string; // classe blur Tailwind
}

export default function FlouBoss({ children, className, intensite = "blur-[8px]" }: Props) {
  const boss = useBoss();
  return (
    <span
      className={`${className ?? ""} ${boss ? "" : `select-none ${intensite}`}`}
      aria-hidden={!boss || undefined}
      title={boss ? undefined : "Réservé au boss du game"}
    >
      {children}
    </span>
  );
}
