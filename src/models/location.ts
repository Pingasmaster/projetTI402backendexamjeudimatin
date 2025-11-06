// structure les emplacements logistiques dans le code

// données brutes sur les contenus de la localisation
export interface LocationLevelProps {
  level: number;
  bins: string[];
}

// représentation d'une localuisation et encapsule la logique de duplication/lecture
export class LocationLevel {
  constructor(private readonly props: LocationLevelProps) {}

  static fromRaw(props: LocationLevelProps): LocationLevel {
    return new LocationLevel({
      level: props.level,
      bins: [...props.bins],
    });
  }

  get level(): number {
    return this.props.level;
  }

  get bins(): string[] {
    return [...this.props.bins];
  }

  // indique si le niveau contient un bac identifié par son code
  containsBin(binCode: string): boolean {
    return this.props.bins.includes(binCode);
  }

  clone(): LocationLevel {
    return LocationLevel.fromRaw(this.toJSON());
  }

  toJSON(): LocationLevelProps {
    return {
      level: this.props.level,
      bins: [...this.props.bins],
    };
  }
}

// normalise le rack et ses niveaux
export interface LocationRackProps {
  rack: string;
  levels: LocationLevelProps[];
}

// rassemble la logique métier d'un rack et des niveaux
export class LocationRack {
  constructor(
    private readonly rackId: string,
    private readonly levelEntities: LocationLevel[],
  ) {}

  static fromRaw(props: LocationRackProps): LocationRack {
    return new LocationRack(
      props.rack,
      props.levels.map(LocationLevel.fromRaw),
    );
  }

  get rack(): string {
    return this.rackId;
  }

  get levels(): LocationLevel[] {
    return this.levelEntities.map((level) => level.clone());
  }

  // cherche la présence d'un bac dans les niveaux du rack
  containsBin(binCode: string): boolean {
    return this.levelEntities.some((level) => level.containsBin(binCode));
  }

  clone(): LocationRack {
    return LocationRack.fromRaw(this.toJSON());
  }

  toJSON(): LocationRackProps {
    return {
      rack: this.rackId,
      levels: this.levelEntities.map((level) => level.toJSON()),
    };
  }
}

// structure de données sérialisable pour une allée
export interface LocationAisleProps {
  aisle: string;
  racks: LocationRackProps[];
}

// gestion métier d'une allée et des racks associés
export class LocationAisle {
  constructor(
    private readonly aisleId: string,
    private readonly rackEntities: LocationRack[],
  ) {}

  static fromRaw(props: LocationAisleProps): LocationAisle {
    return new LocationAisle(
      props.aisle,
      props.racks.map(LocationRack.fromRaw),
    );
  }

  get aisle(): string {
    return this.aisleId;
  }

  get racks(): LocationRack[] {
    return this.rackEntities.map((rack) => rack.clone());
  }

  // recherche un bac dans l'ensemble des racks de l'allée
  containsBin(binCode: string): boolean {
    return this.rackEntities.some((rack) => rack.containsBin(binCode));
  }

  clone(): LocationAisle {
    return LocationAisle.fromRaw(this.toJSON());
  }

  toJSON(): LocationAisleProps {
    return {
      aisle: this.aisleId,
      racks: this.rackEntities.map((rack) => rack.toJSON()),
    };
  }
}

// schéma complet d'un emplacement d'entrepôt
export interface WarehouseLocationProps {
  warehouse_id: number;
  code: string;
  layout: LocationAisleProps[];
  metadata?: Record<string, unknown>;
}

export type WarehouseLocationCreateProps = Omit<
  WarehouseLocationProps,
  "warehouse_id"
>;

export type WarehouseLocationUpdateProps = Partial<WarehouseLocationCreateProps>;

// objet métier principal décrivant un emplacement d'entrepôt et sa structure
export class WarehouseLocation {
  private readonly aisles: LocationAisle[];
  private readonly metadataValue?: Record<string, unknown>;

  private constructor(
    private readonly warehouseIdValue: number,
    private readonly codeValue: string,
    aisles: LocationAisle[],
    metadata?: Record<string, unknown>,
  ) {
    this.aisles = aisles;
    this.metadataValue = metadata ? { ...metadata } : undefined;
  }

  static fromDatabase(record: WarehouseLocationProps): WarehouseLocation {
    return new WarehouseLocation(
      record.warehouse_id,
      record.code,
      record.layout.map(LocationAisle.fromRaw),
      record.metadata ? { ...record.metadata } : undefined,
    );
  }

  static create(
    warehouseId: number,
    props: WarehouseLocationCreateProps,
  ): WarehouseLocation {
    return new WarehouseLocation(
      warehouseId,
      props.code,
      props.layout.map(LocationAisle.fromRaw),
      props.metadata ? { ...props.metadata } : undefined,
    );
  }

  get warehouseId(): number {
    return this.warehouseIdValue;
  }

  get code(): string {
    return this.codeValue;
  }

  // retourne une copie de la structure d'allées/racks/niveaux
  get layout(): LocationAisle[] {
    return this.aisles.map((aisle) => aisle.clone());
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.metadataValue ? { ...this.metadataValue } : undefined;
  }

  // construit une nouvelle instance avec les mises à jour fournies sans muter l'objet
  withUpdates(
    updates: WarehouseLocationUpdateProps,
  ): WarehouseLocation {
    const updatedLayout = updates.layout
      ? updates.layout.map(LocationAisle.fromRaw)
      : this.aisles.map((aisle) => aisle.clone());
    const updatedMetadata =
      updates.metadata !== undefined
        ? updates.metadata
        : this.metadataValue
          ? { ...this.metadataValue }
          : undefined;

    return new WarehouseLocation(
      this.warehouseIdValue,
      updates.code ?? this.codeValue,
      updatedLayout,
      updatedMetadata,
    );
  }

  containsBin(binCode: string): boolean {
    return this.aisles.some((aisle) => aisle.containsBin(binCode));
  }

  // sérialise l'objet sous une forme exploitable par la couche de persistance
  toJSON(): WarehouseLocationProps {
    return {
      warehouse_id: this.warehouseIdValue,
      code: this.codeValue,
      layout: this.aisles.map((aisle) => aisle.toJSON()),
      metadata: this.metadataValue ? { ...this.metadataValue } : undefined,
    };
  }
}
