// filtre les requêtes
import { ZodTypeAny, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    // valide le corps, les paramètres et la query entrante
    // ça permet d'unifier la validation des routes derrière
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      // formate les erreurs zod pour renvoyer un retour exploitable côté client
      const errors = result.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        message: "Données invalides",
        errors,
      });
    }

    const parsed = result.data as {
      body?: typeof req.body;
      params?: typeof req.params;
      query?: typeof req.query;
    };

    if (parsed.body) {
      // substitue le corps en s'appuyant sur les données parsées et typées
      req.body = parsed.body;
    }

    if (parsed.params) {
      // ajoute les paramètres validés sans écraser totalement l'objet initial
      Object.assign(req.params as Record<string, unknown>, parsed.params);
    }

    if (parsed.query) {
      // harmonise la query pour la suite de la chaîne de middlewares
      Object.assign(req.query as Record<string, unknown>, parsed.query);
    }

    next();
  };
