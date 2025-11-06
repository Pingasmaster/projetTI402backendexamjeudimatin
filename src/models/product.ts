export interface ProductProps {
  id: number;
  name: string;
  reference: string;
  quantity: number;
  warehouse_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductCreateProps = Omit<ProductProps, "id" | "created_at" | "updated_at">;

export type ProductUpdateProps = Partial<ProductCreateProps>;

export class Product {
  constructor(private readonly props: ProductProps) {}

  static fromDatabase(record: ProductProps): Product {
    return new Product({ ...record });
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get reference(): string {
    return this.props.reference;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get warehouseId(): number {
    return this.props.warehouse_id;
  }

  get createdAt(): Date | undefined {
    return this.props.created_at;
  }

  get updatedAt(): Date | undefined {
    return this.props.updated_at;
  }

  withUpdates(updates: ProductUpdateProps): Product {
    return new Product({
      ...this.props,
      ...updates,
      warehouse_id: updates.warehouse_id ?? this.props.warehouse_id,
    });
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}
