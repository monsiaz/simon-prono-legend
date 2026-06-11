# Simon Prono Legend 👑

> Ici, on ne rêve pas : on prédit.

Pronostics statistiques de la **Coupe du Monde 2026**, recalculés après chaque coup de sifflet final :
probabilités 1·N·2, heatmaps de scorelines, cotes de titre, tableau final simulé — et les scores exacts
conseillés, réservés au boss du game. **Live : [simon-prono-legend.vercel.app](https://simon-prono-legend.vercel.app)**

## Le modèle

Aucune cote recopiée chez un bookmaker, aucune boîte noire :

1. **Elo pondéré** — calibré sur 37 312 matchs internationaux (1980 → aujourd'hui), K selon l'enjeu
   (Coupe du Monde 60 · qualifications/continentaux 50 · amicaux 25), multiplicateur de marge de buts,
   avantage du terrain estimé par recherche sur grille (+80 Elo).
2. **Poisson bivarié à lien log** (Maher 1982) avec **correction des petits scores** (Dixon & Coles 1997) —
   α, β et ρ ajustés par maximum de vraisemblance pondéré par récence, jamais codés en dur.
3. **Monte Carlo** — 10 000 tournois complets simulés, conditionnés sur les résultats acquis :
   groupes, 8 meilleurs troisièmes (couplage de contraintes sur le tableau officiel), 32es → finale.
4. **Prono à espérance maximale** — le score conseillé maximise l'espérance de points d'un barème de
   jeu de pronostics, pas la simple probabilité.

**Backtest honnête** (walk-forward, out-of-sample, 1 313 matchs 2025-26) : log-loss 0,836 (hasard 1,10) ·
RPS 0,161 (hasard ≈ 0,24) · 62 % de bons résultats. Détails sur [/methode](https://simon-prono-legend.vercel.app/methode).

## Stack

Next.js 16 (App Router, ISR 30 min) · TypeScript · Tailwind 4 · GSAP · Vitest. Zéro base de données.

```bash
npm install
npm test                              # 46 tests
npm run dev

# Recalibrer les ratings (CSV d'historique requis dans data-raw/)
npx tsx scripts/calibrate-ratings.ts
```

### Variables d'environnement (compte boss)

| Variable | Rôle |
|---|---|
| `BOSS_EMAIL` | email du compte boss |
| `BOSS_PASSWORD_HASH` | hash bcrypt du mot de passe (jamais le mot de passe en clair) |
| `SESSION_SECRET` | secret HMAC des jetons de session |

## Données

- Historique des matchs internationaux : dataset communautaire en licence **CC0** ([martj42/international_results](https://github.com/martj42/international_results))
- Calendrier et résultats live : flux public [fixturedownload.com](https://fixturedownload.com)
- Drapeaux : [flag-icons](https://github.com/lipis/flag-icons) (MIT)

## Licence

MIT — © Simon Azoulay · GraciaMedia. Probabilités, pas certitudes : aucun lien avec un opérateur de paris.
