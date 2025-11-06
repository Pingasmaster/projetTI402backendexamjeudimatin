import { postgresPool } from "../config/postgres";
import { Product } from "../models/product";
import { AppError } from "../middlewares/errorHandler";

export const listProducts = async (): Promise<Product[]> => {
  const result = await postgresPool.query<Product>(
    "SELECT * FROM products ORDER BY id ASC",
  );
  return result.rows;
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const result = await postgresPool.query<Product>(
    `INSERT INTO products (name, reference, quantity, warehouse_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [product.name, product.reference, product.quantity, product.warehouse_id],
  );

  return result.rows[0];
};

export const updateProduct = async (
  id: number,
  updates: Partial<Omit<Product, "id">>,
): Promise<Product> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${fields.length + 1}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    const existing = await postgresPool.query<Product>(
      "SELECT * FROM products WHERE id = $1",
      [id],
    );
    if (existing.rowCount === 0) {
      throw new AppError("Produit introuvable", 404);
    }
    return existing.rows[0];
  }

  values.push(id);
  const result = await postgresPool.query<Product>(
    `UPDATE products
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  if (result.rowCount === 0) {
    throw new AppError("Produit introuvable", 404);
  }

  return result.rows[0];
};

export const deleteProduct = async (id: number): Promise<void> => {
  const result = await postgresPool.query(
    "DELETE FROM products WHERE id = $1",
    [id],
  );

  if (result.rowCount === 0) {
    throw new AppError("Produit introuvable", 404);
  }
};
