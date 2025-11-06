import { Request, Response } from "express";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouse,
  listWarehouses,
  updateWarehouse,
} from "../services/warehouseService";

export const getWarehouses = async (_req: Request, res: Response) => {
  const warehouses = await listWarehouses();
  res.json(warehouses);
};

export const getWarehouseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const warehouse = await getWarehouse(id);
  res.json(warehouse);
};

export const postWarehouse = async (req: Request, res: Response) => {
  const warehouse = await createWarehouse(req.body);
  res.status(201).json(warehouse);
};

export const putWarehouse = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await updateWarehouse(id, req.body);
  res.json(updated);
};

export const removeWarehouse = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteWarehouse(id);
  res.status(204).send();
};
