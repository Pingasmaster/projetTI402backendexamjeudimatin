import { z } from "zod";

// schémas Zod centralisant les validations pour l'inscription et la connexion

// nom d'utilisateur reutilisable pour pouvoir appliquer les mêmes contraintes partout
const usernameSchema = z
  .string()
  .trim()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(50, "Le nom d'utilisateur doit contenir moins de 50 caractères")
  .regex(/^[a-zA-Z0-9._-]+$/, "Formats autorisés : lettres, chiffres, ._-");

// mot de passe avec contrainte de longueur minimum
const registrationPasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères");

// mot de passe requis lors de la connexion
const loginPasswordSchema = z
  .string()
  .min(1, "Le mot de passe est requis");

// rôles supportés par l'application
const roleSchema = z.enum(["user", "admin"]);

// validation de la requête d'inscription REST (body JSON uniquement)
export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: registrationPasswordSchema,
    role: roleSchema.optional(),
  }),
});

// validation de la requête de connexion REST
export const loginSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: loginPasswordSchema,
  }),
});
