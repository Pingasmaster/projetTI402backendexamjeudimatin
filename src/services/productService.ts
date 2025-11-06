// service des OPs produit

import { Pool } from "pg";
import { postgresPool } from "../config/postgres";
import {
  Product,
  ProductCreateProps,
  ProductProps,
  ProductUpdateProps,
} from "../models/product";
import { AppError } from "../middlewares/errorHandler";

// encapsule les opérations CRUD sur les produits et centralise les vérifications d'existence
export class ProductService {
  constructor(private readonly db: Pool = postgresPool) {}

  // retourne la liste des produits classés par identifiant croissant
  async listProducts(): Promise<Product[]> {
    const result = await this.db.query<ProductProps>(
      "SELECT * FROM products ORDER BY id ASC",
    );
    return result.rows.map(Product.fromDatabase);
  }

  // insère un nouveau produit et renvoie sa représentation de domaine
  async createProduct(product: ProductCreateProps): Promise<Product> {
    const result = await this.db.query<ProductProps>(
      `INSERT INTO products (name, reference, quantity, warehouse_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product.name, product.reference, product.quantity, product.warehouse_id],
    );

    return Product.fromDatabase(result.rows[0]);
  }

  // mets à jour un produit existant en ne modifiant que les champs fournis
  async updateProduct(
    id: number,
    updates: ProductUpdateProps,
  ): Promise<Product> {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${fields.length + 1}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      const existing = await this.db.query<ProductProps>(
        "SELECT * FROM products WHERE id = $1",
        [id],
      );
      if (existing.rowCount === 0) {
        throw new AppError("Produit introuvable", 404);
      }
      return Product.fromDatabase(existing.rows[0]);
    }

    values.push(id);
    const result = await this.db.query<ProductProps>(
      `UPDATE products
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      throw new AppError("Produit introuvable", 404);
    }

    return Product.fromDatabase(result.rows[0]);
  }

  // supprime un produit si celui-ci existe
  async deleteProduct(id: number): Promise<void> {
    const result = await this.db.query(
      "DELETE FROM products WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      throw new AppError("Produit introuvable", 404);
    }
  }
}
