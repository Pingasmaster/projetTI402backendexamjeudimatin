// restitue les plans d'entrepôt
import { Request, Response } from "express";
import {
  WarehouseLocationCreateProps,
  WarehouseLocationUpdateProps,
} from "../models/location";
import { LocationService } from "../services/locationService";

export class LocationController {
  constructor(private readonly service: LocationService) {}

  // récup la config d'emplacements pour un entrepôt donné
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

  // crée la configuration d'emplacements pour l'entrepôt ciblé
  public readonly createWarehouseLocations = async (
    req: Request,
    res: Response,
  ) => {
    const warehouseId = Number(req.params.id);
    const payload = req.body as WarehouseLocationCreateProps;
    const created = await this.service.createWarehouseLocation(warehouseId, payload);
    res.status(201).json(created.toJSON());
  };

  // mets à jour la configuration d'emplacements existante
  public readonly updateWarehouseLocations = async (
    req: Request,
    res: Response,
  ) => {
    const warehouseId = Number(req.params.id);
    const updates = req.body as WarehouseLocationUpdateProps;
    const updated = await this.service.updateWarehouseLocation(warehouseId, updates);
    res.json(updated.toJSON());
  };

  // vérifie l'existence d'une localisation identifiée par son code
  public readonly getBinExists = async (req: Request, res: Response) => {
    const { binCode } = req.params;
    const exists = await this.service.binExists(binCode);
    res.json({ binCode, exists });
  };
}
