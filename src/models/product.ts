// modèle produit utilisé côté serveur

// représentation complète d'un produit
export interface ProductProps {
  id: number;
  name: string;
  reference: string;
  quantity: number;
  warehouse_id: number;
  created_at?: Date;
  updated_at?: Date;
}

// données attendues pour créer un produit dans le système
export type ProductCreateProps = Omit<ProductProps, "id" | "created_at" | "updated_at">;

// ensemble de champs modifiables d'un produit existant
export type ProductUpdateProps = Partial<ProductCreateProps>;

// modèle métier pour un produit dans l'inventaire
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

  // produit une nouvelle instance avec les modifications souhaitées
  withUpdates(updates: ProductUpdateProps): Product {
    return new Product({
      ...this.props,
      ...updates,
      warehouse_id: updates.warehouse_id ?? this.props.warehouse_id,
    });
  }

  // donne l'état brut du produit
  toJSON(): ProductProps {
    return { ...this.props };
  }
}
