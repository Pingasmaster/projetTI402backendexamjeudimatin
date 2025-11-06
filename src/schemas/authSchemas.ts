import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(50, "Le nom d'utilisateur doit contenir moins de 50 caractères")
  .regex(/^[a-zA-Z0-9._-]+$/, "Formats autorisés : lettres, chiffres, ._-");

const registrationPasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères");

const loginPasswordSchema = z
  .string()
  .min(1, "Le mot de passe est requis");

const roleSchema = z.enum(["user", "admin"]);

export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: registrationPasswordSchema,
    role: roleSchema.optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: loginPasswordSchema,
  }),
});
