import { afterEach, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import {
  creerJetonSession,
  DUREE_SESSION_S,
  normaliserMotDePasse,
  verifierIdentifiants,
  verifierJetonSession,
} from "./session";

const ENV = { ...process.env };

beforeEach(() => {
  process.env.SESSION_SECRET = "secret-de-test";
  process.env.BOSS_EMAIL = "boss@exemple.fr";
  process.env.BOSS_PASSWORD_HASH_B64 = Buffer.from(bcrypt.hashSync(normaliserMotDePasse("Simon Boxing Legend"), 4)).toString("base64");
});

afterEach(() => {
  process.env = { ...ENV };
});

describe("normaliserMotDePasse", () => {
  it("tolère majuscules et espaces (mot de passe dicté)", () => {
    expect(normaliserMotDePasse("Simon Boxing Legend")).toBe("simonboxinglegend");
    expect(normaliserMotDePasse("simonboxinglegend")).toBe("simonboxinglegend");
    expect(normaliserMotDePasse("  simon  boxing\tlegend ")).toBe("simonboxinglegend");
  });
});

describe("verifierIdentifiants", () => {
  it("accepte le bon couple, avec ou sans espaces dans le mot de passe", async () => {
    expect(await verifierIdentifiants("boss@exemple.fr", "simon boxing legend")).toBe(true);
    expect(await verifierIdentifiants("BOSS@exemple.fr", "simonboxinglegend")).toBe(true);
  });

  it("refuse mauvais email ou mauvais mot de passe", async () => {
    expect(await verifierIdentifiants("autre@exemple.fr", "simon boxing legend")).toBe(false);
    expect(await verifierIdentifiants("boss@exemple.fr", "mauvais")).toBe(false);
  });

  it("refuse tout si l'environnement n'est pas configuré", async () => {
    delete process.env.BOSS_PASSWORD_HASH_B64;
    expect(await verifierIdentifiants("boss@exemple.fr", "simon boxing legend")).toBe(false);
  });
});

describe("jeton de session", () => {
  it("valide un jeton signé non expiré", () => {
    expect(verifierJetonSession(creerJetonSession())).toBe(true);
  });

  it("refuse un jeton expiré", () => {
    const jeton = creerJetonSession(Date.now() - (DUREE_SESSION_S + 10) * 1000);
    expect(verifierJetonSession(jeton)).toBe(false);
  });

  it("refuse un jeton falsifié ou vide", () => {
    const jeton = creerJetonSession();
    expect(verifierJetonSession(jeton.slice(0, -2) + "zz")).toBe(false);
    expect(verifierJetonSession("boss:9999999999999.signature-bidon")).toBe(false);
    expect(verifierJetonSession(undefined)).toBe(false);
  });

  it("refuse si le secret change (signature invalide)", () => {
    const jeton = creerJetonSession();
    process.env.SESSION_SECRET = "autre-secret";
    expect(verifierJetonSession(jeton)).toBe(false);
  });
});
