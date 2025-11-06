// simplifie la gestion des promesses côté Express
import { RequestHandler } from "express";

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  // on renvoie un middleware Express qui enveloppe la version asynchrone
  (req, res, next) => {
    // on force la résolution de la promesse pour capter les erreurs via next()
    Promise.resolve(handler(req, res, next)).catch(next);
  };
