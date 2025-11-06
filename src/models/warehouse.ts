// modèle entrepôt

// représentation d'un entrepôt
export interface WarehouseProps {
  id: number;
  name: string;
  location: string;
  created_at?: Date;
  updated_at?: Date;
}

// données nécessaires pour créer un entrepôt
export type WarehouseCreateProps = Omit<WarehouseProps, "id" | "created_at" | "updated_at">;

// champs modifiables pour mettre à jour un entrepôt existant
export type WarehouseUpdateProps = Partial<WarehouseCreateProps>;

// objet métier d'un entrepôt
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

  // retourne une nouvelle instance avec les mises à jour
  withUpdates(updates: WarehouseUpdateProps): Warehouse {
    return new Warehouse({
      ...this.props,
      ...updates,
    });
  }

   // prépare les données de l'entrepôt pour la sérialisation
  toJSON(): WarehouseProps {
    return { ...this.props };
  }
}
