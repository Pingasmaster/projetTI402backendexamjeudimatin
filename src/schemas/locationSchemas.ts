import { z } from "zod";

// schémas de validation pour un entrepot

// identifiant court d'un bac individuel
const binCodeSchema = z.string().min(1, { message: "Le code bac est requis" });

// un niveau regroupe plusieurs bacs au sein d'un rack
const levelSchema = z.object({
  level: z.coerce.number().int().min(0, {
    message: "Le niveau doit être supérieur ou égal à 0",
  }),
  bins: z.array(binCodeSchema).min(1, {
    message: "Chaque niveau doit contenir au moins un bac",
  }),
});

// chaque rack contient un ensemble de niveaux
const rackSchema = z.object({
  rack: z.string().min(1, { message: "Le rack est requis" }),
  levels: z.array(levelSchema).min(1, {
    message: "Chaque rack doit contenir au moins un niveau",
  }),
});

// une allée organise plusieurs racks
const aisleSchema = z.object({
  aisle: z.string().min(1, { message: "L'allée est requise" }),
  racks: z.array(rackSchema).min(1, {
    message: "Chaque allée doit contenir au moins un rack",
  }),
});

// payload complet de création/mise à jour
const locationBodySchema = z.object({
  code: z.string().min(1, { message: "Le code de l'entrepôt est requis" }),
  layout: z.array(aisleSchema).min(1, {
    message: "La configuration doit contenir au moins une allée",
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// création d'une configuration de localisation pour un entrepôt cible
export const createWarehouseLocationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: locationBodySchema,
});

// récupération de la configuration pour un entrepôt donné
export const getWarehouseLocationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

// mise à jour partielle de la config existante
export const updateWarehouseLocationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: locationBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
  }),
});

// vérification de la présence d'un bac par son code
export const binExistsSchema = z.object({
  params: z.object({
    binCode: binCodeSchema,
  }),
});
