// Ce fichier centralise les erreurs pour offrir des retours lisibles.
import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(message: string, statusCode = 500, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    message: "Erreur interne du serveur",
  });
};
