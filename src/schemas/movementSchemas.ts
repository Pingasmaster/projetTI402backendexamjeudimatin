import { z } from "zod";

export const createMovementSchema = z.object({
  body: z.object({
    type: z.enum(["IN", "OUT"]),
    quantity: z.coerce.number().int().positive({
      message: "La quantité doit être positive",
    }),
    product_id: z.coerce.number().int().positive({
      message: "Le produit doit être positif",
    }),
  }),
});
