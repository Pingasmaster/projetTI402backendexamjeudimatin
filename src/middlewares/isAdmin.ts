// auth admin
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // Vérifie que l'utilisateur courant dispose du rôle administrateur.
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès interdit",
      details: "Rôle administrateur requis",
    });
  }

  next();
};
