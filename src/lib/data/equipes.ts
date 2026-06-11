// Référentiel des 48 qualifiés : clé dataset → nom FR + drapeau + rating Elo.

import ratingsJson from "@/data/ratings.json";
import { clefEquipe } from "./noms";

export interface Equipe {
  clef: string;
  nomFr: string;
  drapeau: string;
  elo: number;
}

const INFOS: Record<string, { nomFr: string; drapeau: string }> = {
  algeria: { nomFr: "Algérie", drapeau: "🇩🇿" },
  argentina: { nomFr: "Argentine", drapeau: "🇦🇷" },
  australia: { nomFr: "Australie", drapeau: "🇦🇺" },
  austria: { nomFr: "Autriche", drapeau: "🇦🇹" },
  belgium: { nomFr: "Belgique", drapeau: "🇧🇪" },
  "bosnia-and-herzegovina": { nomFr: "Bosnie-Herzégovine", drapeau: "🇧🇦" },
  brazil: { nomFr: "Brésil", drapeau: "🇧🇷" },
  "cape-verde": { nomFr: "Cap-Vert", drapeau: "🇨🇻" },
  canada: { nomFr: "Canada", drapeau: "🇨🇦" },
  colombia: { nomFr: "Colombie", drapeau: "🇨🇴" },
  "dr-congo": { nomFr: "RD Congo", drapeau: "🇨🇩" },
  croatia: { nomFr: "Croatie", drapeau: "🇭🇷" },
  curacao: { nomFr: "Curaçao", drapeau: "🇨🇼" },
  "czech-republic": { nomFr: "Tchéquie", drapeau: "🇨🇿" },
  "ivory-coast": { nomFr: "Côte d'Ivoire", drapeau: "🇨🇮" },
  ecuador: { nomFr: "Équateur", drapeau: "🇪🇨" },
  egypt: { nomFr: "Égypte", drapeau: "🇪🇬" },
  england: { nomFr: "Angleterre", drapeau: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  france: { nomFr: "France", drapeau: "🇫🇷" },
  germany: { nomFr: "Allemagne", drapeau: "🇩🇪" },
  ghana: { nomFr: "Ghana", drapeau: "🇬🇭" },
  haiti: { nomFr: "Haïti", drapeau: "🇭🇹" },
  iran: { nomFr: "Iran", drapeau: "🇮🇷" },
  iraq: { nomFr: "Irak", drapeau: "🇮🇶" },
  japan: { nomFr: "Japon", drapeau: "🇯🇵" },
  jordan: { nomFr: "Jordanie", drapeau: "🇯🇴" },
  "south-korea": { nomFr: "Corée du Sud", drapeau: "🇰🇷" },
  mexico: { nomFr: "Mexique", drapeau: "🇲🇽" },
  morocco: { nomFr: "Maroc", drapeau: "🇲🇦" },
  netherlands: { nomFr: "Pays-Bas", drapeau: "🇳🇱" },
  "new-zealand": { nomFr: "Nouvelle-Zélande", drapeau: "🇳🇿" },
  norway: { nomFr: "Norvège", drapeau: "🇳🇴" },
  panama: { nomFr: "Panama", drapeau: "🇵🇦" },
  paraguay: { nomFr: "Paraguay", drapeau: "🇵🇾" },
  portugal: { nomFr: "Portugal", drapeau: "🇵🇹" },
  qatar: { nomFr: "Qatar", drapeau: "🇶🇦" },
  "saudi-arabia": { nomFr: "Arabie saoudite", drapeau: "🇸🇦" },
  scotland: { nomFr: "Écosse", drapeau: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  senegal: { nomFr: "Sénégal", drapeau: "🇸🇳" },
  "south-africa": { nomFr: "Afrique du Sud", drapeau: "🇿🇦" },
  spain: { nomFr: "Espagne", drapeau: "🇪🇸" },
  sweden: { nomFr: "Suède", drapeau: "🇸🇪" },
  switzerland: { nomFr: "Suisse", drapeau: "🇨🇭" },
  tunisia: { nomFr: "Tunisie", drapeau: "🇹🇳" },
  turkey: { nomFr: "Turquie", drapeau: "🇹🇷" },
  "united-states": { nomFr: "États-Unis", drapeau: "🇺🇸" },
  uruguay: { nomFr: "Uruguay", drapeau: "🇺🇾" },
  uzbekistan: { nomFr: "Ouzbékistan", drapeau: "🇺🇿" },
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
