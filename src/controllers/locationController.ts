import { Request, Response } from "express";
import {
  WarehouseLocationCreateProps,
  WarehouseLocationUpdateProps,
} from "../models/location";
import { LocationService } from "../services/locationService";

export class LocationController {
  constructor(private readonly service: LocationService) {}

  public readonly getWarehouseLocations = async (req: Request, res: Response) => {
    const warehouseId = Number(req.params.id);
    const location = await this.service.getWarehouseLocation(warehouseId);

    if (!location) {
      return res.status(404).json({
        message: "Configuration introuvable pour cet entrepôt",
      });
    }

    res.json(location.toJSON());
  };

  public readonly createWarehouseLocations = async (
    req: Request,
    res: Response,
  ) => {
    const warehouseId = Number(req.params.id);
    const payload = req.body as WarehouseLocationCreateProps;
    const created = await this.service.createWarehouseLocation(warehouseId, payload);
    res.status(201).json(created.toJSON());
  };

  public readonly updateWarehouseLocations = async (
    req: Request,
    res: Response,
  ) => {
    const warehouseId = Number(req.params.id);
    const updates = req.body as WarehouseLocationUpdateProps;
    const updated = await this.service.updateWarehouseLocation(warehouseId, updates);
    res.json(updated.toJSON());
  };

  public readonly getBinExists = async (req: Request, res: Response) => {
    const { binCode } = req.params;
    const exists = await this.service.binExists(binCode);
    res.json({ binCode, exists });
  };
}
