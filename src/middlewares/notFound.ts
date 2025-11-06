// gestion des erreurs 404
import { Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  // réponse JSON 404 explicite pour les routes inexistantes
  res.status(404).json({
    message: "Ressource introuvable",
  });
};
