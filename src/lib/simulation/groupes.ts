// Classement d'un groupe selon les critères FIFA : points, différence de buts,
// buts marqués, puis confrontations directes entre équipes à égalité. Dernier
// recours (tirage au sort dans le règlement) : rating Elo — déterministe.

export interface MatchGroupe {
  domicile: string;
  exterieur: string;
  butsDomicile: number;
  butsExterieur: number;
}

export interface LigneClassement {
  equipe: string;
  joues: number;
  points: number;
  difference: number;
  butsPour: number;
  butsContre: number;
}

function lignesVides(equipes: string[]): Map<string, LigneClassement> {
  return new Map(
    equipes.map((equipe) => [equipe, { equipe, joues: 0, points: 0, difference: 0, butsPour: 0, butsContre: 0 }]),
  );
}

function appliquer(lignes: Map<string, LigneClassement>, m: MatchGroupe): void {
  const domicile = lignes.get(m.domicile)!;
  const exterieur = lignes.get(m.exterieur)!;
  domicile.joues++;
  exterieur.joues++;
  domicile.butsPour += m.butsDomicile;
  domicile.butsContre += m.butsExterieur;
  exterieur.butsPour += m.butsExterieur;
  exterieur.butsContre += m.butsDomicile;
  domicile.difference = domicile.butsPour - domicile.butsContre;
  exterieur.difference = exterieur.butsPour - exterieur.butsContre;
  if (m.butsDomicile > m.butsExterieur) domicile.points += 3;
  else if (m.butsDomicile < m.butsExterieur) exterieur.points += 3;
  else {
    domicile.points += 1;
    exterieur.points += 1;
  }
}

function comparerLignes(a: LigneClassement, b: LigneClassement): number {
  return b.points - a.points || b.difference - a.difference || b.butsPour - a.butsPour;
}

export function classerGroupe(equipes: string[], matchs: MatchGroupe[], elos: Map<string, number>): LigneClassement[] {
  const lignes = lignesVides(equipes);
  for (const m of matchs) appliquer(lignes, m);
  const classement = [...lignes.values()].sort(comparerLignes);

  // Départage des ex æquo stricts par mini-classement des confrontations directes.
  for (let debut = 0; debut < classement.length; ) {
    let fin = debut + 1;
    while (fin < classement.length && comparerLignes(classement[debut], classement[fin]) === 0) fin++;
    if (fin - debut > 1) {
      const noms = new Set(classement.slice(debut, fin).map((l) => l.equipe));
      const directes = matchs.filter((m) => noms.has(m.domicile) && noms.has(m.exterieur));
      const mini = new Map([...lignesVides([...noms])]);
      for (const m of directes) appliquer(mini, m);
      classement.splice(
        debut,
        fin - debut,
        ...classement
          .slice(debut, fin)
          .sort(
            (a, b) =>
              comparerLignes(mini.get(a.equipe)!, mini.get(b.equipe)!) ||
              (elos.get(b.equipe) ?? 0) - (elos.get(a.equipe) ?? 0),
          ),
      );
    }
    debut = fin;
  }
  return classement;
}
