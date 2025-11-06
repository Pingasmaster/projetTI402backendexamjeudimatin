import { z } from "zod";

// schémas de validation pour les entrepôts

// champs communs aux OPs
const nameSchema = z.string().min(1, { message: "Le nom de l'entrepôt est requis" });
const locationSchema = z.string().min(1, { message: "La localisation est requise" });

// création d'un entrepot avec ses champs requis
export const createWarehouseSchema = z.object({
  body: z.object({
    name: nameSchema,
    location: locationSchema,
  }),
});

// mise à jour d'un entrepôt par son id
export const updateWarehouseSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      location: locationSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Au moins un champ doit être fourni pour la mise à jour",
    }),
});

// récuperation d'un entrepôt
export const getWarehouseSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

// suppression partage le code de la lecture
export const deleteWarehouseSchema = getWarehouseSchema;
