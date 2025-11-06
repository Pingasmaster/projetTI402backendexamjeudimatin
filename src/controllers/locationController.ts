import { Request, Response } from "express";
import {
  binExists,
  createWarehouseLocation,
  getWarehouseLocation,
  updateWarehouseLocation,
} from "../services/locationService";

export const getWarehouseLocations = async (req: Request, res: Response) => {
  const warehouseId = Number(req.params.id);
  const location = await getWarehouseLocation(warehouseId);

  if (!location) {
    return res.status(404).json({
      message: "Configuration introuvable pour cet entrepôt",
    });
  }

  res.json(location);
};

export const createWarehouseLocations = async (req: Request, res: Response) => {
  const warehouseId = Number(req.params.id);
  const created = await createWarehouseLocation(warehouseId, req.body);
  res.status(201).json(created);
};

export const updateWarehouseLocations = async (req: Request, res: Response) => {
  const warehouseId = Number(req.params.id);
  const updated = await updateWarehouseLocation(warehouseId, req.body);
  res.json(updated);
};

export const getBinExists = async (req: Request, res: Response) => {
  const { binCode } = req.params;
  const exists = await binExists(binCode);
  res.json({ binCode, exists });
};
