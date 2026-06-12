"use client";

// Mon compte : connexion boss. Connecté → les scores se défloutent partout.

import { useState } from "react";
import { useBoss, notifierChangementSession } from "@/lib/auth/useBoss";

export default function PageCompte() {
  const boss = useBoss();
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Mon compte<span className="text-volt">.</span>
      </h1>
      {boss ? <Connecte /> : <Formulaire />}
    </div>
  );
}

function Connecte() {
  const [enCours, setEnCours] = useState(false);
  const deconnecter = async () => {
    setEnCours(true);
    await fetch("/api/deconnexion", { method: "POST" });
    notifierChangementSession();
    setEnCours(false);
  };
  return (
    <div className="terrain-filigrane mt-6 rounded-2xl border border-volt/40 bg-carte p-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
      <img src="/visuels/mascotte-legende.webp" alt="La mascotte Simon Prono Legend, couronne et trophée" width={240} height={320} className="mx-auto w-52 rounded-2xl border border-volt/30" />
      <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">
        Bienvenue, <span className="text-volt">boss du game</span>
      </p>
      <p className="mt-2 text-sm text-brume">
        Les scores exacts et le vainqueur prédit sont maintenant visibles partout sur le site.
      </p>
      <button
        type="button"
        onClick={deconnecter}
        disabled={enCours}
        className="mt-6 cursor-pointer rounded-full border border-ligne px-6 py-2.5 font-data text-sm font-bold uppercase tracking-wider text-brume transition-colors duration-200 hover:border-rouge hover:text-rouge disabled:opacity-50"
      >
        Me déconnecter
      </button>
    </div>
  );
}

function Formulaire() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const connecter = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });
      if (reponse.ok) {
        notifierChangementSession();
      } else {
        const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
        setErreur(corps?.erreur ?? "Connexion impossible, réessaie.");
      }
    } catch {
      setErreur("Connexion impossible, réessaie.");
    }
    setEnCours(false);
  };

  return (
    <form onSubmit={connecter} className="mt-6 rounded-2xl border border-ligne bg-carte p-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- asset local */}
      <img src="/visuels/bd-billet.webp" alt="Billet doré boss only" width={320} height={213} className="mx-auto w-full max-w-xs rounded-2xl" />
      <p className="mt-4 text-sm text-brume">
        Réservé au boss du game. Connecté, tu vois les scores exacts et le vainqueur prédit — les autres restent sur le
        flou.
      </p>
      <label htmlFor="email" className="mt-5 block font-data text-xs uppercase tracking-wider text-brume">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-ligne bg-surface px-4 py-3 text-sm text-craie outline-none transition-colors focus:border-volt"
      />
      <label htmlFor="motDePasse" className="mt-4 block font-data text-xs uppercase tracking-wider text-brume">
        Mot de passe
      </label>
      <MotDePasse valeur={motDePasse} onChange={setMotDePasse} />
      {erreur && (
        <p role="alert" className="mt-3 text-sm text-rouge">
          {erreur}
        </p>
      )}
      <button
        type="submit"
        disabled={enCours}
        className="mt-5 w-full cursor-pointer rounded-full bg-volt px-6 py-3 font-data text-sm font-bold uppercase tracking-wider text-nuit transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
      >
        {enCours ? "Connexion…" : "Je suis le boss"}
      </button>
    </form>
  );
}

function MotDePasse({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-1.5">
      <input
        id="motDePasse"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        required
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ligne bg-surface px-4 py-3 pr-20 text-sm text-craie outline-none transition-colors focus:border-volt"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer font-data text-[10px] uppercase tracking-wider text-brume hover:text-craie"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}
