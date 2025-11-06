import { postgresPool } from "../config/postgres";
import { Movement, MovementType } from "../models/movement";
import { AppError } from "../middlewares/errorHandler";

interface MovementInput {
  type: MovementType;
  quantity: number;
  product_id: number;
}

export const listMovements = async (): Promise<Movement[]> => {
  const result = await postgresPool.query<Movement>(
    "SELECT * FROM movements ORDER BY created_at DESC",
  );
  return result.rows;
};

export const createMovement = async (input: MovementInput): Promise<Movement> => {
  const client = await postgresPool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, quantity FROM products WHERE id = $1 FOR UPDATE",
      [input.product_id],
    );

    if (productResult.rowCount === 0) {
      throw new AppError("Produit introuvable", 404);
    }

    const currentQuantity: number = productResult.rows[0].quantity;
    let newQuantity = currentQuantity;

    if (input.type === "IN") {
      newQuantity += input.quantity;
    } else {
      newQuantity -= input.quantity;
      if (newQuantity < 0) {
        throw new AppError("Stock insuffisant pour ce mouvement", 400);
      }
    }

    await client.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [newQuantity, input.product_id],
    );

    const movementResult = await client.query<Movement>(
      `INSERT INTO movements (type, quantity, product_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.type, input.quantity, input.product_id],
    );

    await client.query("COMMIT");

    return movementResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
