// Drapeau carré (SVG flag-icons 1x1, self-hosted dans public/drapeaux/).

const TAILLES = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
} as const;

export type TailleDrapeau = keyof typeof TAILLES;

interface Props {
  iso: string; // code flag-icons (ex. "fr", "gb-eng")
  nom: string;
  taille?: TailleDrapeau;
}

export default function Drapeau({ iso, nom, taille = "md" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG local, pas d'optimisation nécessaire
    <img
      src={`/drapeaux/${iso}.svg`}
      alt={`Drapeau : ${nom}`}
      width={40}
      height={40}
      loading="lazy"
      className={`${TAILLES[taille]} shrink-0 rounded-md object-cover ring-1 ring-craie/10`}
    />
  );
}
