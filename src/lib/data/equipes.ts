// Référentiel des 48 qualifiés : clé dataset → nom FR + drapeau + rating Elo.

import ratingsJson from "@/data/ratings.json";
import { clefEquipe } from "./noms";

export interface Equipe {
  clef: string;
  nomFr: string;
  iso: string; // code drapeau flag-icons
  elo: number;
}

const INFOS: Record<string, { nomFr: string; iso: string }> = {
  algeria: { nomFr: "Algérie", iso: "dz" },
  argentina: { nomFr: "Argentine", iso: "ar" },
  australia: { nomFr: "Australie", iso: "au" },
  austria: { nomFr: "Autriche", iso: "at" },
  belgium: { nomFr: "Belgique", iso: "be" },
  "bosnia-and-herzegovina": { nomFr: "Bosnie-Herzégovine", iso: "ba" },
  brazil: { nomFr: "Brésil", iso: "br" },
  "cape-verde": { nomFr: "Cap-Vert", iso: "cv" },
  canada: { nomFr: "Canada", iso: "ca" },
  colombia: { nomFr: "Colombie", iso: "co" },
  "dr-congo": { nomFr: "RD Congo", iso: "cd" },
  croatia: { nomFr: "Croatie", iso: "hr" },
  curacao: { nomFr: "Curaçao", iso: "cw" },
  "czech-republic": { nomFr: "Tchéquie", iso: "cz" },
  "ivory-coast": { nomFr: "Côte d'Ivoire", iso: "ci" },
  ecuador: { nomFr: "Équateur", iso: "ec" },
  egypt: { nomFr: "Égypte", iso: "eg" },
  england: { nomFr: "Angleterre", iso: "gb-eng" },
  france: { nomFr: "France", iso: "fr" },
  germany: { nomFr: "Allemagne", iso: "de" },
  ghana: { nomFr: "Ghana", iso: "gh" },
  haiti: { nomFr: "Haïti", iso: "ht" },
  iran: { nomFr: "Iran", iso: "ir" },
  iraq: { nomFr: "Irak", iso: "iq" },
  japan: { nomFr: "Japon", iso: "jp" },
  jordan: { nomFr: "Jordanie", iso: "jo" },
  "south-korea": { nomFr: "Corée du Sud", iso: "kr" },
  mexico: { nomFr: "Mexique", iso: "mx" },
  morocco: { nomFr: "Maroc", iso: "ma" },
  netherlands: { nomFr: "Pays-Bas", iso: "nl" },
  "new-zealand": { nomFr: "Nouvelle-Zélande", iso: "nz" },
  norway: { nomFr: "Norvège", iso: "no" },
  panama: { nomFr: "Panama", iso: "pa" },
  paraguay: { nomFr: "Paraguay", iso: "py" },
  portugal: { nomFr: "Portugal", iso: "pt" },
  qatar: { nomFr: "Qatar", iso: "qa" },
  "saudi-arabia": { nomFr: "Arabie saoudite", iso: "sa" },
  scotland: { nomFr: "Écosse", iso: "gb-sct" },
  senegal: { nomFr: "Sénégal", iso: "sn" },
  "south-africa": { nomFr: "Afrique du Sud", iso: "za" },
  spain: { nomFr: "Espagne", iso: "es" },
  sweden: { nomFr: "Suède", iso: "se" },
  switzerland: { nomFr: "Suisse", iso: "ch" },
  tunisia: { nomFr: "Tunisie", iso: "tn" },
  turkey: { nomFr: "Turquie", iso: "tr" },
  "united-states": { nomFr: "États-Unis", iso: "us" },
  uruguay: { nomFr: "Uruguay", iso: "uy" },
  uzbekistan: { nomFr: "Ouzbékistan", iso: "uz" },
};

// Pays hôtes — bonus Elo domicile quand ils jouent sur leur sol.
export const HOTES = new Set(["united-states", "mexico", "canada"]);

const ratings = ratingsJson.ratings as Record<string, number>;

export const PARAMETRES_CALIBRES = ratingsJson.parametres;

export function equipeDepuisNomFifa(nomFifa: string): Equipe {
  const clef = clefEquipe(nomFifa);
  const infos = INFOS[clef];
  const elo = ratings[clef];
  if (!infos || elo == null) throw new Error(`Équipe inconnue du référentiel : "${nomFifa}" (clef "${clef}")`);
  return { clef, ...infos, elo };
}

export function toutesLesEquipes(): Equipe[] {
  return Object.keys(INFOS).map((clef) => ({ clef, ...INFOS[clef], elo: ratings[clef] }));
}
