// Vignette décorative BD : purement illustrative, invisible aux lecteurs d'écran.

export default function Vignette({ src, className, taille = 112 }: { src: string; className?: string; taille?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset local
    <img
      src={src}
      alt=""
      aria-hidden
      width={taille}
      height={taille}
      loading="lazy"
      className={`shrink-0 rounded-2xl ${className ?? ""}`}
    />
  );
}
