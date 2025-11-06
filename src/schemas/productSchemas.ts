import { z } from "zod";

const nameSchema = z.string().min(1, { message: "Le nom est requis" });
const referenceSchema = z.string().min(1, { message: "La référence est requise" });
const quantitySchema = z.coerce.number().int().min(0, {
  message: "La quantité doit être positive ou nulle",
});
const warehouseIdSchema = z.coerce.number().int().positive({
  message: "L'entrepôt doit être positif",
});

export const createProductSchema = z.object({
  body: z.object({
    name: nameSchema,
    reference: referenceSchema,
    quantity: quantitySchema,
    warehouse_id: warehouseIdSchema,
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      reference: referenceSchema.optional(),
      quantity: quantitySchema.optional(),
      warehouse_id: warehouseIdSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Au moins un champ doit être fourni pour la mise à jour",
    }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
