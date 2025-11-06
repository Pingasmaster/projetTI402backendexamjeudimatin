import { z } from "zod";

const nameSchema = z.string().min(1, { message: "Le nom de l'entrepôt est requis" });
const locationSchema = z.string().min(1, { message: "La localisation est requise" });

export const createWarehouseSchema = z.object({
  body: z.object({
    name: nameSchema,
    location: locationSchema,
  }),
});

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

export const getWarehouseSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const deleteWarehouseSchema = getWarehouseSchema;
