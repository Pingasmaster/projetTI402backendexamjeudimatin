import { Request, Response } from "express";
import { listMovements, createMovement } from "../services/movementService";

export const getMovements = async (_req: Request, res: Response) => {
  const movements = await listMovements();
  res.json(movements);
};

export const postMovement = async (req: Request, res: Response) => {
  const movement = await createMovement(req.body);
  res.status(201).json(movement);
};
