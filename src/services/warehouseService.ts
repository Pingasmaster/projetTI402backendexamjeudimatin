import { postgresPool } from "../config/postgres";
import { Warehouse } from "../models/warehouse";
import { AppError } from "../middlewares/errorHandler";

export const listWarehouses = async (): Promise<Warehouse[]> => {
  const result = await postgresPool.query<Warehouse>(
    "SELECT * FROM warehouses ORDER BY id ASC",
  );
  return result.rows;
};

export const getWarehouse = async (id: number): Promise<Warehouse> => {
  const result = await postgresPool.query<Warehouse>(
    "SELECT * FROM warehouses WHERE id = $1",
    [id],
  );

  if (result.rowCount === 0) {
    throw new AppError("Entrepôt introuvable", 404);
  }

  return result.rows[0];
};

export const createWarehouse = async (
  warehouse: Omit<Warehouse, "id" | "created_at" | "updated_at">,
): Promise<Warehouse> => {
  const result = await postgresPool.query<Warehouse>(
    `INSERT INTO warehouses (name, location)
     VALUES ($1, $2)
     RETURNING *`,
    [warehouse.name, warehouse.location],
  );

  return result.rows[0];
};

export const updateWarehouse = async (
  id: number,
  updates: Partial<Omit<Warehouse, "id" | "created_at" | "updated_at">>,
): Promise<Warehouse> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${fields.length + 1}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return getWarehouse(id);
  }

  values.push(id);

  const result = await postgresPool.query<Warehouse>(
    `UPDATE warehouses
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  if (result.rowCount === 0) {
    throw new AppError("Entrepôt introuvable", 404);
  }

  return result.rows[0];
};

export const deleteWarehouse = async (id: number): Promise<void> => {
  const result = await postgresPool.query("DELETE FROM warehouses WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new AppError("Entrepôt introuvable", 404);
  }
};
