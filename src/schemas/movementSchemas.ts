import { z } from "zod";

// schéma Zod pilotant la validation des mouvements de stock entrants/sortants

// création d'un mouvement avec type et quantité contrôlés
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
