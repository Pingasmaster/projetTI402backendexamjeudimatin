import { Request, Response } from "express";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

export const getProducts = async (_req: Request, res: Response) => {
  const products = await listProducts();
  res.json(products);
};

export const postProduct = async (req: Request, res: Response) => {
  const { name, reference, quantity, warehouse_id } = req.body;
  const product = await createProduct({ name, reference, quantity, warehouse_id });
  res.status(201).json(product);
};

export const putProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await updateProduct(id, req.body);
  res.json(updated);
};

export const removeProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteProduct(id);
  res.status(204).send();
};
