// Ajustement des paramètres du modèle de buts sur les observations :
//  - (α, β) : régression de Poisson à lien log, λ = exp(α + β·écartElo/400),
//    par maximum de vraisemblance pondéré (poids exponentiellement décroissant
//    avec l'âge du match — les dynamiques récentes pèsent plus).
//  - ρ : correction Dixon-Coles, par maximum de vraisemblance sur grille.

import { pmfPoisson } from "../../src/lib/moteur/poisson";
import { correctionDixonColes } from "../../src/lib/moteur/scorelines";
import type { ObservationMatch } from "./passe-elo";

const DEMI_VIE_ANNEES = 3;

export function poidsRecence(date: string, reference: string): number {
  const age = (Date.parse(reference) - Date.parse(date)) / (365.25 * 24 * 3600 * 1000);
  return Math.exp((-Math.LN2 * age) / DEMI_VIE_ANNEES);
}

interface CoteObservee {
  ecart: number; // (eloAttaque + bonus − eloDéfense) / 400
  buts: number;
  poids: number;
}

function aplatir(observations: ObservationMatch[], avantageDomicile: number, reference: string): CoteObservee[] {
  const cotes: CoteObservee[] = [];
  for (const o of observations) {
    const bonus = o.terrainNeutre ? 0 : avantageDomicile;
    const poids = poidsRecence(o.date, reference);
    cotes.push({ ecart: (o.eloDomicile + bonus - o.eloExterieur) / 400, buts: o.butsDomicile, poids });
    cotes.push({ ecart: (o.eloExterieur - o.eloDomicile - bonus) / 400, buts: o.butsExterieur, poids });
  }
  return cotes;
}

export function ajusterAlphaBeta(
  observations: ObservationMatch[],
  avantageDomicile: number,
  reference: string,
): { alpha: number; beta: number } {
  const cotes = aplatir(observations, avantageDomicile, reference);
  let meilleur = { alpha: 0.3, beta: 0.8, vraisemblance: -Infinity };
  for (let alpha = 0.05; alpha <= 0.5; alpha += 0.01) {
    for (let beta = 0.3; beta <= 1.5; beta += 0.02) {
      let vraisemblance = 0;
      for (const c of cotes) {
        const lambda = Math.exp(alpha + beta * c.ecart);
        vraisemblance += c.poids * (c.buts * Math.log(lambda) - lambda);
      }
      if (vraisemblance > meilleur.vraisemblance) meilleur = { alpha, beta, vraisemblance };
    }
  }
  return { alpha: meilleur.alpha, beta: meilleur.beta };
}

export function ajusterRho(
  observations: ObservationMatch[],
  avantageDomicile: number,
  alpha: number,
  beta: number,
  reference: string,
): number {
  let meilleurRho = 0;
  let meilleureVraisemblance = -Infinity;
  for (let rho = -0.25; rho <= 0.05; rho += 0.005) {
    let vraisemblance = 0;
    for (const o of observations) {
      const bonus = o.terrainNeutre ? 0 : avantageDomicile;
      const lambda = Math.exp(alpha + (beta * (o.eloDomicile + bonus - o.eloExterieur)) / 400);
      const mu = Math.exp(alpha + (beta * (o.eloExterieur - o.eloDomicile - bonus)) / 400);
      const correction = correctionDixonColes(o.butsDomicile, o.butsExterieur, lambda, mu, rho);
      if (correction <= 0) {
        vraisemblance = -Infinity;
        break;
      }
      const p = pmfPoisson(o.butsDomicile, lambda) * pmfPoisson(o.butsExterieur, mu) * correction;
      vraisemblance += poidsRecence(o.date, reference) * Math.log(p);
    }
    if (vraisemblance > meilleureVraisemblance) {
      meilleureVraisemblance = vraisemblance;
      meilleurRho = rho;
    }
  }
  return Number(meilleurRho.toFixed(3));
}
