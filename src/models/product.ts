export interface Product {
  id: number;
  name: string;
  reference: string;
  quantity: number;
  warehouse_id: number;
  created_at?: Date;
  updated_at?: Date;
}
