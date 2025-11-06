// Ce fichier filtre les requêtes dès l'entrée pour préserver la qualité des données.
import { ZodTypeAny, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
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
      req.body = parsed.body;
    }

    if (parsed.params) {
      Object.assign(req.params as Record<string, unknown>, parsed.params);
    }

    if (parsed.query) {
      Object.assign(req.query as Record<string, unknown>, parsed.query);
    }

    next();
  };
