// Ce fichier transforme les requêtes entrepôt en réponses utiles pour le terrain.
import { Request, Response } from "express";
import {
  WarehouseCreateProps,
  WarehouseUpdateProps,
} from "../models/warehouse";
import { WarehouseService } from "../services/warehouseService";

export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  public readonly getWarehouses = async (_req: Request, res: Response) => {
    const warehouses = await this.service.listWarehouses();
    res.json(warehouses.map((warehouse) => warehouse.toJSON()));
  };

  public readonly getWarehouseById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const warehouse = await this.service.getWarehouse(id);
    res.json(warehouse.toJSON());
  };

  public readonly postWarehouse = async (req: Request, res: Response) => {
    const payload = req.body as WarehouseCreateProps;
    const warehouse = await this.service.createWarehouse(payload);
    res.status(201).json(warehouse.toJSON());
  };

  public readonly putWarehouse = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updates = req.body as WarehouseUpdateProps;
    const updated = await this.service.updateWarehouse(id, updates);
    res.json(updated.toJSON());
  };

  public readonly removeWarehouse = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.deleteWarehouse(id);
    res.status(204).send();
  };
}
