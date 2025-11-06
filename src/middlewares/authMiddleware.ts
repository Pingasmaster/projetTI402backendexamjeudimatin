// Ce fichier authentifie les requêtes et transmet les rôles avec soin.
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

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Non autorisé",
      details: "Un token Bearer valide est requis",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: Number(decoded.sub),
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Non autorisé",
      details: "Token invalide ou expiré",
    });
  }
};
