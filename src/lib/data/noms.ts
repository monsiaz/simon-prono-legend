// Normalisation des noms d'équipes — fait le pont entre le feed calendrier
// (noms FIFA, ex. "Korea Republic") et le dataset historique (noms usuels).

export function normaliserNom(nom: string): string {
  return nom
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Clé : nom FIFA normalisé → nom dataset normalisé.
export const ALIAS_FIFA_VERS_DATASET: Record<string, string> = {
  "korea-republic": "south-korea",
  "ir-iran": "iran",
  czechia: "czech-republic",
  "cabo-verde": "cape-verde",
  "congo-dr": "dr-congo",
  "cote-d-ivoire": "ivory-coast",
  turkiye: "turkey",
  "united-states": "united-states",
  usa: "united-states",
};

export function clefEquipe(nomFifa: string): string {
  const normalise = normaliserNom(nomFifa);
  return ALIAS_FIFA_VERS_DATASET[normalise] ?? normalise;
}
