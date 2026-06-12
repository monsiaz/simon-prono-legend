// Actus : la rédaction de Simon Prono Legend. Quatre signatures, un seul
// vrai patron. Chaque chiffre sort du modèle ou des données ouvertes.

import Apparition from "@/components/anim/Apparition";
import Drapeau from "@/components/Drapeau";
import Vignette from "@/components/Vignette";
import buteursJson from "@/data/buteurs.json";
import ratingsJson from "@/data/ratings.json";
import { toutesLesEquipes } from "@/lib/data/equipes";
import { chargerPronostics } from "@/lib/service/pronostics";
import { jourFr } from "@/lib/ui/format";
import { LIBELLE_VERDICT } from "@/lib/ui/verdict";

export const revalidate = 1800;

export const metadata = {
  title: "Actus — Simon Prono Legend",
  description:
    "La rédaction décortique le Mondial 2026 : le match piège du moment, le favori écrasant, la vérif des pronos du boss et la forme des buteurs. Chiffres du modèle uniquement.",
};

const REDACTION = [
  { nom: "Le Boss", role: "Édito, vision, modestie", image: "/visuels/bd-pouce.webp" },
  { nom: "Prof. Poisson", role: "Cellule stats, ne sort jamais sans son λ", image: "/visuels/bd-savant.webp" },
  { nom: "La Cellule VAR", role: "Vérifie chaque prono au sifflet final", image: "/visuels/bd-var.webp" },
  { nom: "Le Stagiaire", role: "Compte les buts, porte les cafés", image: "/visuels/commentateur.webp" },
];

export default async function PageActus() {
  const { matchs, simulation, tracking } = await chargerPronostics();
  const equipes = new Map(toutesLesEquipes().map((e) => [e.clef, e]));

  const aVenir = matchs.filter((m) => !m.calendrier.joue && m.prevision && m.domicile && m.exterieur);
  const plusSerre = [...aVenir].sort(
    (a, b) => Math.abs(a.prevision!.probaA - a.prevision!.probaB) - Math.abs(b.prevision!.probaA - b.prevision!.probaB),
  )[0];
  const plusGrosFavori = [...aVenir].sort(
    (a, b) =>
      Math.max(b.prevision!.probaA, b.prevision!.probaB) - Math.max(a.prevision!.probaA, a.prevision!.probaB),
  )[0];
  const juges = matchs.filter((m) => m.calendrier.joue && m.verdict);
  const dernierJuge = [...juges].sort((a, b) => b.calendrier.numero - a.calendrier.numero)[0];
  const [favori, deuxieme, troisieme] = simulation.probas.filter((p) => equipes.has(p.clef));
  const buteur = buteursJson.buteurs[0];
  const equipeButeur = equipes.get(buteur.equipe);

  return (
    <Apparition className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 data-reveal className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        La rédaction<span className="text-volt">.</span>
      </h1>
      <p data-reveal className="mt-2 text-sm text-brume">
        Quatre plumes, zéro rumeur de vestiaire : tout ce qui s&apos;écrit ici sort du modèle, recalculé toutes
        les 30 minutes. Le café, lui, est instantané.
      </p>

      <div data-reveal className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {REDACTION.map((membre) => (
          <div key={membre.nom} className="rounded-2xl border border-ligne bg-carte p-3 text-center">
            <Vignette src={membre.image} taille={80} className="mx-auto w-16 sm:w-20" />
            <p className="mt-2 font-display text-sm font-black uppercase">{membre.nom}</p>
            <p className="mt-0.5 font-data text-[10px] leading-snug text-brume">{membre.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        <Billet signature="Le Boss" etiquette="L'édito" titre={editoTitre(tracking)}>
          <p>{editoTexte(tracking)}</p>
          <p>
            Pour la course au titre, trois nations, <Inline equipe={equipes.get(favori.clef)} />,{" "}
            <Inline equipe={equipes.get(deuxieme.clef)} /> et <Inline equipe={equipes.get(troisieme.clef)} />{" "}
            (l&apos;ordre ? Connecte-toi, ah non : t&apos;es pas moi), cumulent{" "}
            {Math.round((favori.titre + deuxieme.titre + troisieme.titre) * 100)} % des couronnes simulées. Le
            reste du plateau se partage les miettes. Grosses miettes quand même : un Mondial à 48, ça glisse.
          </p>
        </Billet>

        {plusSerre && (
          <Billet signature="Prof. Poisson" etiquette="Le match piège" titre={`${plusSerre.domicile!.nomFr} – ${plusSerre.exterieur!.nomFr} : la pièce est en l'air`}>
            <p>
              Le {jourFr(plusSerre.calendrier.dateUtc)}, mon λ tremble :{" "}
              <Inline equipe={plusSerre.domicile!} /> à {(plusSerre.prevision!.probaA * 100).toFixed(0)} %,{" "}
              <Inline equipe={plusSerre.exterieur!} /> à {(plusSerre.prevision!.probaB * 100).toFixed(0)} %, le
              nul à {(plusSerre.prevision!.probaNul * 100).toFixed(0)} %. {(plusSerre.prevision!.lambdaA + plusSerre.prevision!.lambdaB).toFixed(1)}{" "}
              buts attendus au total : match fermé en perspective. C&apos;est exactement le genre d&apos;affiche
              où le barème récompense les courageux. Le boss a tranché, évidemment. Flouté, évidemment.
            </p>
          </Billet>
        )}

        {plusGrosFavori && (
          <Billet
            signature="Prof. Poisson"
            etiquette="Le rouleau compresseur"
            titre={`${Math.round(Math.max(plusGrosFavori.prevision!.probaA, plusGrosFavori.prevision!.probaB) * 100)} % : le modèle n'a jamais été aussi sûr de lui`}
          >
            <p>
              {plusGrosFavori.prevision!.probaA > plusGrosFavori.prevision!.probaB ? (
                <>
                  <Inline equipe={plusGrosFavori.domicile!} /> contre <Inline equipe={plusGrosFavori.exterieur!} />
                </>
              ) : (
                <>
                  <Inline equipe={plusGrosFavori.exterieur!} /> contre <Inline equipe={plusGrosFavori.domicile!} />
                </>
              )}
              , le {jourFr(plusGrosFavori.calendrier.dateUtc)} : l&apos;écart d&apos;Elo est tel que la défaite du
              favori relèverait du fait divers. Attention quand même, le football adore les faits divers. On en
              reparle au coup de sifflet, la Cellule VAR prépare déjà son tampon.
            </p>
          </Billet>
        )}

        {dernierJuge && dernierJuge.prono && (
          <Billet
            signature="La Cellule VAR"
            etiquette="Après visionnage"
            titre={`${dernierJuge.domicile!.nomFr} – ${dernierJuge.exterieur!.nomFr} : verdict, ${LIBELLE_VERDICT[dernierJuge.verdict!].toLowerCase()}`}
          >
            <p>
              Prono déposé avant le coup d&apos;envoi : {dernierJuge.prono.butsA}–{dernierJuge.prono.butsB}. Score
              final : {dernierJuge.calendrier.butsDomicile}–{dernierJuge.calendrier.butsExterieur}. Après
              visionnage des images sous tous les angles, la décision est confirmée :{" "}
              {dernierJuge.verdict === "exact" && "score exact. Le tampon « DANS LE MILLE » a servi. On l'avait fait fabriquer en espérant, on ne pensait pas s'en servir dès le premier soir."}
              {dernierJuge.verdict === "resultat" && "bon vainqueur. Pas le score parfait, mais le tableau de chasse s'allonge."}
              {dernierJuge.verdict === "perdu" && "raté. Le boss parle d'une « anomalie statistique ». La Cellule VAR n'a pas le droit de rire."}{" "}
              Bilan à date : {tracking.exacts} dans le mille, {tracking.bonsResultats} bon{tracking.bonsResultats > 1 ? "s" : ""} call{tracking.bonsResultats > 1 ? "s" : ""},{" "}
              {tracking.perdus} à côté. Tout est public, en home.
            </p>
          </Billet>
        )}

        {equipeButeur && (
          <Billet signature="Le Stagiaire" etiquette="Le compteur de buts" titre={`${buteur.nom} : ${buteur.buts} buts depuis 2024, j'ai vérifié trois fois`}>
            <p>
              On m&apos;a demandé de compter les buts en sélection depuis janvier 2024. <Inline equipe={equipeButeur} />{" "}
              peut remercier {buteur.nom} : {buteur.buts} buts, dont {buteur.penaltys} sur pénalty, répartis sur{" "}
              {buteur.matchsAvecBut} matchs. Le deuxième est loin. Le classement complet des 30 buteurs en forme
              est sur la page Buteurs. On m&apos;a aussi demandé deux sucres, c&apos;est fait.
            </p>
          </Billet>
        )}

        <Billet signature="Prof. Poisson" etiquette="Le format" titre="48 équipes, 8 meilleurs troisièmes : tout se joue au goal-average">
          <p>
            Nouveau format, nouvelle mécanique : 12 groupes de 4, les deux premiers passent, plus les{" "}
            <strong className="text-craie">8 meilleurs troisièmes</strong> sur 12. Dans nos simulations, finir 3e
            avec 4 points et une différence de buts correcte qualifie presque à tous les coups. La marge de buts
            du dernier match de poule fait basculer des destins. L&apos;affectation des troisièmes au tableau
            (chaque place n&apos;accepte que certains groupes) se résout par couplage de contraintes, comme le
            fera la FIFA. Oui, je me suis amusé en l&apos;implémentant. Non, je ne sortirai pas plus que ça.
          </p>
        </Billet>

        <Billet signature="La Cellule VAR" etiquette="Mode d'emploi" titre="Lire un prono comme un pro : confiance, espérance, score voilé">
          <p>
            Chaque carte de match donne la probabilité 1·N·2, un niveau de confiance (élevée dès que l&apos;issue
            la plus probable dépasse 60 %) et un score conseillé calculé pour maximiser l&apos;espérance de points
            d&apos;un jeu de pronostics, pas pour faire joli. Ce score est flouté, et ce que vous croyez deviner
            sous le flou est un leurre : on a vérifié les images, vous ne voyez rien. La méthode complète et le
            backtest sur {ratingsJson.backtest.matchsEvalues} matchs sont sur la page Méthode.
          </p>
        </Billet>
      </div>
    </Apparition>
  );
}

function editoTitre(t: { exacts: number; perdus: number; joues: number }): string {
  if (t.joues === 0) return "On ne rêve pas, on prédit : le Mondial du boss commence";
  if (t.exacts > 0 && t.perdus === 0) return "Premiers matchs, premiers cartons pleins : la légende n'attend pas";
  if (t.perdus === 0) return "Toujours invaincu : le tableau de chasse s'allonge";
  return "On encaisse, on recalibre, on repart : parole de boss";
}

function editoTexte(t: { exacts: number; bonsResultats: number; perdus: number; joues: number; points: number }): string {
  if (t.joues === 0)
    return "Le modèle a avalé 37 000 matchs pour préparer celui-ci. Moi, j'ai préparé mon plus beau survêtement. Chacun son rôle.";
  const bilan = `${t.joues} prono${t.joues > 1 ? "s" : ""} jugé${t.joues > 1 ? "s" : ""}, ${t.exacts} dans le mille, ${t.bonsResultats} bon${t.bonsResultats > 1 ? "s" : ""} call${t.bonsResultats > 1 ? "s" : ""}, ${t.perdus} à côté. ${t.points} points.`;
  if (t.perdus === 0)
    return `${bilan} Certains appellent ça de la chance. Le Prof. Poisson appelle ça « une réalisation favorable de la distribution ». Moi j'appelle ça mardi.`;
  return `${bilan} Les jours sans, ça existe. C'est même précisément quantifié dans le modèle. La différence entre un touriste et un boss : le boss connaît sa variance.`;
}

function Billet({ signature, etiquette, titre, children }: { signature: string; etiquette: string; titre: string; children: React.ReactNode }) {
  return (
    <article data-reveal className="rounded-2xl border border-ligne bg-carte p-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-data text-[10px] uppercase tracking-[0.25em] text-volt">{etiquette}</p>
        <p className="font-data text-[10px] uppercase tracking-wider text-brume">par {signature}</p>
      </div>
      <h2 className="mt-2 font-display text-xl font-black leading-snug tracking-tight sm:text-2xl">{titre}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-brume">{children}</div>
    </article>
  );
}

function Inline({ equipe }: { equipe?: { nomFr: string; iso: string } }) {
  if (!equipe) return null;
  return (
    <span className="whitespace-nowrap font-medium text-craie">
      <Drapeau iso={equipe.iso} nom={equipe.nomFr} taille="xs" /> {equipe.nomFr}
    </span>
  );
}
