// expose des actions autour des mouvements de stock
import { Request, Response } from "express";
import { MovementCreateProps } from "../models/movement";
import { MovementService } from "../services/movementService";

export class MovementController {
  constructor(private readonly service: MovementService) {}

  // liste l'historique des mouvements de stock
  public readonly getMovements = async (_req: Request, res: Response) => {
    const movements = await this.service.listMovements();
    res.json(movements.map((movement) => movement.toJSON()));
  };

  // enregistre un nouveau mouvement et retourne sa représentation
  public readonly postMovement = async (req: Request, res: Response) => {
    const payload = req.body as MovementCreateProps;
    const movement = await this.service.createMovement(payload);
    res.status(201).json(movement.toJSON());
  };
}
