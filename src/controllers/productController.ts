// Ce fichier coordonne les échanges autour des produits avec sobriété.
import { Request, Response } from "express";
import {
  ProductCreateProps,
  ProductUpdateProps,
} from "../models/product";
import { ProductService } from "../services/productService";

export class ProductController {
  constructor(private readonly service: ProductService) {}

  public readonly getProducts = async (_req: Request, res: Response) => {
    const products = await this.service.listProducts();
    res.json(products.map((product) => product.toJSON()));
  };

  public readonly postProduct = async (req: Request, res: Response) => {
    const { name, reference, quantity, warehouse_id } = req.body as ProductCreateProps;
    const product = await this.service.createProduct({
      name,
      reference,
      quantity,
      warehouse_id,
    });
    res.status(201).json(product.toJSON());
  };

  public readonly putProduct = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updates = req.body as ProductUpdateProps;
    const updated = await this.service.updateProduct(id, updates);
    res.json(updated.toJSON());
  };

  public readonly removeProduct = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.deleteProduct(id);
    res.status(204).send();
  };
}
