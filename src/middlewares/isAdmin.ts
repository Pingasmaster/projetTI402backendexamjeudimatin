// Ce fichier s'assure que seules les personnes habilitées touchent aux actions critiques.
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès interdit",
      details: "Rôle administrateur requis",
    });
  }

  next();
};
