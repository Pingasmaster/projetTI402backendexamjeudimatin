export interface WarehouseProps {
  id: number;
  name: string;
  location: string;
  created_at?: Date;
  updated_at?: Date;
}

export type WarehouseCreateProps = Omit<WarehouseProps, "id" | "created_at" | "updated_at">;
export type WarehouseUpdateProps = Partial<WarehouseCreateProps>;

export class Warehouse {
  constructor(private readonly props: WarehouseProps) {}

  static fromDatabase(record: WarehouseProps): Warehouse {
    return new Warehouse({ ...record });
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get location(): string {
    return this.props.location;
  }

  get createdAt(): Date | undefined {
    return this.props.created_at;
  }

  get updatedAt(): Date | undefined {
    return this.props.updated_at;
  }

  withUpdates(updates: WarehouseUpdateProps): Warehouse {
    return new Warehouse({
      ...this.props,
      ...updates,
    });
  }

  toJSON(): WarehouseProps {
    return { ...this.props };
  }
}
