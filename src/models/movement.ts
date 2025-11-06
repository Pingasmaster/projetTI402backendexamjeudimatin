export type MovementType = "IN" | "OUT";

export interface MovementProps {
  id: number;
  type: MovementType;
  quantity: number;
  product_id: number;
  created_at: Date;
}

export interface MovementCreateProps {
  type: MovementType;
  quantity: number;
  product_id: number;
}

export class Movement {
  constructor(private readonly props: MovementProps) {}

  static fromDatabase(record: MovementProps): Movement {
    return new Movement({ ...record });
  }

  get id(): number {
    return this.props.id;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get productId(): number {
    return this.props.product_id;
  }

  get createdAt(): Date {
    return this.props.created_at;
  }

  isInbound(): boolean {
    return this.props.type === "IN";
  }

  toJSON(): MovementProps {
    return { ...this.props };
  }
}
