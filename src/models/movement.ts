export type MovementType = "IN" | "OUT";

export interface Movement {
  id: number;
  type: MovementType;
  quantity: number;
  product_id: number;
  created_at: Date;
}
