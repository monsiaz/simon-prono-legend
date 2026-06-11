// Classement Elo des sélections nationales.
// Mise à jour pondérée par l'importance de la compétition et la marge de buts
// (multiplicateur de marge inspiré du barème public d'eloratings.net).

export function probaVictoireElo(eloA: number, eloB: number, bonusA = 0): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA - bonusA) / 400));
}

export function multiplicateurMarge(ecartButs: number): number {
  const marge = Math.abs(ecartButs);
  if (marge <= 1) return 1;
  if (marge === 2) return 1.5;
  return 1.75 + (marge - 3) * 0.125;
}

export interface MajElo {
  deltaA: number;
  deltaB: number;
}

// scoreA : 1 victoire de A, 0.5 nul, 0 défaite.
export function mettreAJourElo(
  eloA: number,
  eloB: number,
  scoreA: number,
  k: number,
  ecartButs: number,
  bonusA = 0,
): MajElo {
  const attendu = probaVictoireElo(eloA, eloB, bonusA);
  const delta = k * multiplicateurMarge(ecartButs) * (scoreA - attendu);
  return { deltaA: delta, deltaB: -delta };
}
