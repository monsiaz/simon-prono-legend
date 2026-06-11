// Drapeau emoji — contenu signifiant, avec libellé accessible.

export default function Drapeau({ emoji, nom, taille = "text-2xl" }: { emoji: string; nom: string; taille?: string }) {
  return (
    <span role="img" aria-label={`Drapeau : ${nom}`} className={`${taille} leading-none`}>
      {emoji}
    </span>
  );
}
