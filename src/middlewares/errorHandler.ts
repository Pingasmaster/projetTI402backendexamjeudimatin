// centralise la gestion des erreurs
import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(message: string, statusCode = 500, details?: string) {
    super(message);
    // retient les infos nécessaires pour formater la réponse HTTP
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    // applique la bonne structure d'erreur
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  // trace les erreurs inattendues pour faciliter le diagnostic
  console.error("Unexpected error:", err);

  return res.status(500).json({
    message: "Erreur interne du serveur",
  });
};
