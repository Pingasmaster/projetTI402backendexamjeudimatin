import { Pool } from "pg";
import { postgresPool } from "../config/postgres";
import {
  Movement,
  MovementCreateProps,
  MovementProps,
} from "../models/movement";
import { AppError } from "../middlewares/errorHandler";

export class MovementService {
  constructor(private readonly db: Pool = postgresPool) {}

  async listMovements(): Promise<Movement[]> {
    const result = await this.db.query<MovementProps>(
      "SELECT * FROM movements ORDER BY created_at DESC",
    );
    return result.rows.map(Movement.fromDatabase);
  }

  async createMovement(input: MovementCreateProps): Promise<Movement> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const productResult = await client.query<{ id: number; quantity: number }>(
        "SELECT id, quantity FROM products WHERE id = $1 FOR UPDATE",
        [input.product_id],
      );

      if (productResult.rowCount === 0) {
        throw new AppError("Produit introuvable", 404);
      }

      const currentQuantity: number = productResult.rows[0].quantity;
      const newQuantity = this.calculateNewQuantity(currentQuantity, input);

      await client.query(
        "UPDATE products SET quantity = $1 WHERE id = $2",
        [newQuantity, input.product_id],
      );

      const movementResult = await client.query<MovementProps>(
        `INSERT INTO movements (type, quantity, product_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [input.type, input.quantity, input.product_id],
      );

      await client.query("COMMIT");

      return Movement.fromDatabase(movementResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private calculateNewQuantity(
    currentQuantity: number,
    input: MovementCreateProps,
  ): number {
    if (input.type === "IN") {
      return currentQuantity + input.quantity;
    }

    const newQuantity = currentQuantity - input.quantity;

    if (newQuantity < 0) {
      throw new AppError("Stock insuffisant pour ce mouvement", 400);
    }

    return newQuantity;
  }
}
