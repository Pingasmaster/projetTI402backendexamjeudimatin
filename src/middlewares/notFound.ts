// Ce fichier propose une réponse 404 claire lorsque la ressource manque.
import { Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    message: "Ressource introuvable",
  });
};
