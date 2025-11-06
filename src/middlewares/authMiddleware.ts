// authentifie les requêtes et transmet les rôles
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // vérifie que l'appelant fournit bien un token JWT au format attendu
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Non autorisé",
      details: "Un token Bearer valide est requis",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    // mémorise l'identité extraite du token pour les middlewares suivants
    req.user = {
      id: Number(decoded.sub),
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    // rejette explicitement tout token invalide ou expiré
    return res.status(401).json({
      message: "Non autorisé",
      details: "Token invalide ou expiré",
    });
  }
};
