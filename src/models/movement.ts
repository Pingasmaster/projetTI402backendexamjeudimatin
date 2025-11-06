// modèle pour les mouvements de stock
export type MovementType = "IN" | "OUT";

// représentation stockée d'un mouvement individuel
export interface MovementProps {
  id: number;
  type: MovementType;
  quantity: number;
  product_id: number;
  created_at: Date;
}

// données nécessaires pour créer un mouvement côté application
export interface MovementCreateProps {
  type: MovementType;
  quantity: number;
  product_id: number;
}

// encapsule la logique métier d'un mouvement de stock
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

  // permets de savoir si le mouvement ajoute du stock
  isInbound(): boolean {
    return this.props.type === "IN";
  }

  // exporte les données du mouvement vers un format brut
  toJSON(): MovementProps {
    return { ...this.props };
  }
}
