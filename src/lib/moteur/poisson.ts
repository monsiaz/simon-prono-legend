// Loi de Poisson — brique de base du modèle de buts.

export function pmfPoisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

// Tirage par l'algorithme de Knuth (λ modéré — toujours < 5 dans notre usage).
export function tiragePoisson(lambda: number, alea: () => number = Math.random): number {
  const seuil = Math.exp(-lambda);
  let k = 0;
  let produit = 1;
  do {
    k++;
    produit *= alea();
  } while (produit > seuil);
  return k - 1;
}
