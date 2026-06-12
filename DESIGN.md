# Design — Simon Prono Legend

## Direction

« Stade nocturne » : pelouse de nuit sous projecteurs, marquages craie, panneau d'affichage. Sérieux statistique + mise en scène boss.

## Couleurs (tokens Tailwind @theme, globals.css)

- `nuit` #0a0f0c : fond
- `surface` #10180f / `carte` #141d12 : élévations
- `ligne` #233122 : bordures
- `craie` #eff3ec : texte principal
- `brume` #8fa392 : texte secondaire
- `volt` #c8f64f : accent principal (probabilités, victoires, CTA)
- `or` #e8c268 : second accent (titre, podium, nuls/bons résultats)
- `rouge` #f87171 : pertes uniquement

Stratégie : Restrained sur les pages denses (matchs, tables), Committed sur les moments boss (popup, page compte, hero cotes).

## Typographie

- Display : Archivo black, uppercase, tracking tight (`font-display`)
- Data/labels : Space Grotesk (`font-data`), tabular nums partout
- Wordmark : Simon (craie) Prono (volt) Legend (or, skew -6°)

## Motion (GSAP)

- Reveal au scroll : y+fade stagger (`Apparition`, [data-reveal])
- Compteurs de probabilité, barres scaleX origin-left
- Popup boss : back.out(2.2) + wiggle
- SplitText : wordmark (chars) et hero (words masqués)
- Toujours sous gsap.matchMedia prefers-reduced-motion

## Composants signature

- `ScoreFloute` : blur 12px + bouton pill « Voir le score » → popup boss
- `FlouBoss` : blur inline levé pour le boss connecté
- Heatmap scorelines : intensité volt via color-mix
- Filigrane terrain : `.terrain-filigrane` (rond central + médiane craie 5%)

## Interdits locaux

Pas d'emoji-icônes (drapeaux SVG flag-icons), pas de bleu, pas de glassmorphism hors header, vidéo hero = seul média photographique.
