// service pour les entrepôts
import { Pool } from "pg";
import { postgresPool } from "../config/postgres";
import {
  Warehouse,
  WarehouseCreateProps,
  WarehouseProps,
  WarehouseUpdateProps,
} from "../models/warehouse";
import { AppError } from "../middlewares/errorHandler";

// centralise les opérations métiers relatives aux entrepôts
export class WarehouseService {
  constructor(private readonly db: Pool = postgresPool) {}

  // retourne tous les entrepôts triés par identifiant
  async listWarehouses(): Promise<Warehouse[]> {
    const result = await this.db.query<WarehouseProps>(
      "SELECT * FROM warehouses ORDER BY id ASC",
    );
    return result.rows.map(Warehouse.fromDatabase);
  }

  // charge un entrepôt par son identifiant ou déclenche une erreur si absent
  async getWarehouse(id: number): Promise<Warehouse> {
    const result = await this.db.query<WarehouseProps>(
      "SELECT * FROM warehouses WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      throw new AppError("Entrepôt introuvable", 404);
    }

    return Warehouse.fromDatabase(result.rows[0]);
  }

  // crée un nouvel entrepôt et retourne sa représentation de domaine
  async createWarehouse(
    warehouse: WarehouseCreateProps,
  ): Promise<Warehouse> {
    const result = await this.db.query<WarehouseProps>(
      `INSERT INTO warehouses (name, location)
       VALUES ($1, $2)
       RETURNING *`,
      [warehouse.name, warehouse.location],
    );

    return Warehouse.fromDatabase(result.rows[0]);
  }

  // mets à jour un entrepôt
  async updateWarehouse(
    id: number,
    updates: WarehouseUpdateProps,
  ): Promise<Warehouse> {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${fields.length + 1}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.getWarehouse(id);
    }

    values.push(id);

    const result = await this.db.query<WarehouseProps>(
      `UPDATE warehouses
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );

    if (result.rowCount === 0) {
      throw new AppError("Entrepôt introuvable", 404);
    }

    return Warehouse.fromDatabase(result.rows[0]);
  }

  // supprime un entrepôt
  async deleteWarehouse(id: number): Promise<void> {
    const result = await this.db.query("DELETE FROM warehouses WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new AppError("Entrepôt introuvable", 404);
    }
  }
}
