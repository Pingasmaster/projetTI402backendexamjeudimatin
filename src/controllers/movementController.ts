// Ce fichier expose des actions limpides autour des mouvements de stock.
import { Request, Response } from "express";
import { MovementCreateProps } from "../models/movement";
import { MovementService } from "../services/movementService";

export class MovementController {
  constructor(private readonly service: MovementService) {}

  public readonly getMovements = async (_req: Request, res: Response) => {
    const movements = await this.service.listMovements();
    res.json(movements.map((movement) => movement.toJSON()));
  };

  public readonly postMovement = async (req: Request, res: Response) => {
    const payload = req.body as MovementCreateProps;
    const movement = await this.service.createMovement(payload);
    res.status(201).json(movement.toJSON());
  };
}
