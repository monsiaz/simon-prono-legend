// Monte Carlo du tournoi complet, conditionné sur les résultats réels :
// les matchs joués sont verrouillés, seul le restant est simulé. Groupes →
// 8 meilleurs tiers → tableau final (structure officielle FIFA, vérifiée).

import { creerAlea } from "../moteur/alea";
import { type ParametresModele, tirerScore } from "../moteur/scorelines";
import { classerGroupe, type MatchGroupe } from "./groupes";
import { affecterTiers, parsePlaceholderTiers, selectionnerMeilleursTiers, type TiersClasse } from "./meilleurs-tiers";

export interface MatchSim {
  numero: number;
  phase: string;
  groupe: string | null;
  domicile: string | null; // clef équipe, null si non résolu
  exterieur: string | null;
  placeholderDomicile: string | null;
  placeholderExterieur: string | null;
  butsDomicile: number | null;
  butsExterieur: number | null;
  joue: boolean;
  vainqueur: string | null; // clef, si départagé aux tirs au but
  bonusEloNet: number; // bonus domicile net (hôte chez lui), côté "domicile"
}

// Tableau officiel : 8es → finale, vainqueurs des matchs précédents.
const TABLEAU: Record<number, [number, number]> = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
  101: [97, 98], 102: [99, 100], 104: [101, 102],
};
const PETITE_FINALE = 103;
const DEMI_FINALES: [number, number] = [101, 102];

export interface ProbasEquipe {
  clef: string;
  sortieGroupes: number; // qualifiée pour les 32es
  huitiemes: number;
  quarts: number;
  demies: number;
  finale: number;
  titre: number;
}

export interface ResultatSimulation {
  nSims: number;
  probas: ProbasEquipe[];
  // adversaires possibles par match du tableau : clef → fréquence d'apparition
  apparitions: Map<number, Map<string, number>>;
}

export function simulerTournoi(
  matchs: MatchSim[],
  elos: Map<string, number>,
  parametres: ParametresModele,
  nSims = 10000,
  graine = 2026,
): ResultatSimulation {
  const alea = creerAlea(graine);
  const groupes = new Map<string, { equipes: Set<string>; matchs: MatchSim[] }>();
  for (const m of matchs) {
    if (m.phase !== "groupes" || !m.groupe) continue;
    const g = groupes.get(m.groupe) ?? { equipes: new Set(), matchs: [] };
    if (m.domicile) g.equipes.add(m.domicile);
    if (m.exterieur) g.equipes.add(m.exterieur);
    g.matchs.push(m);
    groupes.set(m.groupe, g);
  }
  const matchsTableau = matchs.filter((m) => m.phase !== "groupes").sort((a, b) => a.numero - b.numero);
  const compteurs = new Map<string, ProbasEquipe>();
  const apparitions = new Map<number, Map<string, number>>();
  const compteur = (clef: string) => {
    let c = compteurs.get(clef);
    if (!c) {
      c = { clef, sortieGroupes: 0, huitiemes: 0, quarts: 0, demies: 0, finale: 0, titre: 0 };
      compteurs.set(clef, c);
    }
    return c;
  };
  const elo = (clef: string) => elos.get(clef) ?? 1500;

  const jouerMatch = (m: MatchSim, domicile: string, exterieur: string): string => {
    if (m.joue && m.domicile === domicile && m.exterieur === exterieur) {
      if (m.butsDomicile! > m.butsExterieur!) return domicile;
      if (m.butsDomicile! < m.butsExterieur!) return exterieur;
      return m.vainqueur ?? domicile;
    }
    const tirage = tirerScore(elo(domicile), elo(exterieur), parametres, m.bonusEloNet, true, alea);
    if (tirage.vainqueurTab) return tirage.vainqueurTab === "A" ? domicile : exterieur;
    return tirage.butsA > tirage.butsB ? domicile : exterieur;
  };

  for (let sim = 0; sim < nSims; sim++) {
    // 1. Phase de groupes — réel verrouillé, reste tiré.
    const premiers = new Map<string, string>();
    const deuxiemes = new Map<string, string>();
    const tiers: TiersClasse[] = [];
    for (const [nom, g] of groupes) {
      const resultats: MatchGroupe[] = g.matchs.map((m) => {
        if (m.joue) {
          return { domicile: m.domicile!, exterieur: m.exterieur!, butsDomicile: m.butsDomicile!, butsExterieur: m.butsExterieur! };
        }
        const tirage = tirerScore(elo(m.domicile!), elo(m.exterieur!), parametres, m.bonusEloNet, false, alea);
        return { domicile: m.domicile!, exterieur: m.exterieur!, butsDomicile: tirage.butsA, butsExterieur: tirage.butsB };
      });
      const classement = classerGroupe([...g.equipes], resultats, elos);
      premiers.set(nom, classement[0].equipe);
      deuxiemes.set(nom, classement[1].equipe);
      tiers.push({ ...classement[2], groupe: nom });
    }

    // 2. Meilleurs tiers et affectation aux places du tableau.
    const qualifiesTiers = selectionnerMeilleursTiers(tiers, elos);
    const groupesTiers = qualifiesTiers.map((t) => t.groupe);
    const places = matchsTableau
      .flatMap((m) => [m.placeholderDomicile, m.placeholderExterieur].map((p) => ({ m, p })))
      .filter(({ p }) => p?.startsWith("3") && p.length > 2)
      .map(({ m, p }) => ({ numeroMatch: m.numero, groupesAdmis: parsePlaceholderTiers(p!) }));
    const affectation = affecterTiers(groupesTiers, places) ?? new Map<number, string>();
    const tiersParGroupe = new Map(tiers.map((t) => [t.groupe, t.equipe]));

    for (const [, equipe] of premiers) compteur(equipe).sortieGroupes++;
    for (const [, equipe] of deuxiemes) compteur(equipe).sortieGroupes++;
    for (const t of qualifiesTiers) compteur(t.equipe).sortieGroupes++;

    // 3. Tableau final.
    const resoudre = (m: MatchSim, placeholder: string | null, reel: string | null): string => {
      if (reel) return reel;
      if (!placeholder) throw new Error(`Match ${m.numero} irrésolu`);
      if (/^1[A-L]$/.test(placeholder)) return premiers.get(placeholder[1])!;
      if (/^2[A-L]$/.test(placeholder)) return deuxiemes.get(placeholder[1])!;
      if (placeholder.startsWith("3")) return tiersParGroupe.get(affectation.get(m.numero)!)!;
      throw new Error(`Placeholder inconnu : ${placeholder}`);
    };
    const vainqueurs = new Map<number, string>();
    const perdants = new Map<number, string>();
    const etapes: Record<string, keyof ProbasEquipe | null> = {
      "32es": "huitiemes", "8es": "quarts", quarts: "demies", demies: "finale", "petite-finale": null, finale: "titre",
    };
    for (const m of matchsTableau) {
      let domicile: string;
      let exterieur: string;
      if (m.numero === PETITE_FINALE) {
        domicile = m.domicile ?? perdants.get(DEMI_FINALES[0])!;
        exterieur = m.exterieur ?? perdants.get(DEMI_FINALES[1])!;
      } else if (TABLEAU[m.numero]) {
        domicile = m.domicile ?? vainqueurs.get(TABLEAU[m.numero][0])!;
        exterieur = m.exterieur ?? vainqueurs.get(TABLEAU[m.numero][1])!;
      } else {
        domicile = resoudre(m, m.placeholderDomicile, m.domicile);
        exterieur = resoudre(m, m.placeholderExterieur, m.exterieur);
      }
      let app = apparitions.get(m.numero);
      if (!app) apparitions.set(m.numero, (app = new Map()));
      app.set(domicile, (app.get(domicile) ?? 0) + 1);
      app.set(exterieur, (app.get(exterieur) ?? 0) + 1);

      const vainqueur = jouerMatch(m, domicile, exterieur);
      vainqueurs.set(m.numero, vainqueur);
      perdants.set(m.numero, vainqueur === domicile ? exterieur : domicile);
      const etape = etapes[m.phase];
      if (etape) compteur(vainqueur)[etape]++;
    }
  }

  const probas = [...compteurs.values()]
    .map((c) => ({
      clef: c.clef,
      sortieGroupes: c.sortieGroupes / nSims,
      huitiemes: c.huitiemes / nSims,
      quarts: c.quarts / nSims,
      demies: c.demies / nSims,
      finale: c.finale / nSims,
      titre: c.titre / nSims,
    }))
    .sort((a, b) => b.titre - a.titre || b.finale - a.finale);
  return { nSims, probas, apparitions };
}
