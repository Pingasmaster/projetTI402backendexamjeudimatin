// Ce fichier structure les emplacements logistiques dans le code.
export interface LocationLevelProps {
  level: number;
  bins: string[];
}

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

export interface LocationRackProps {
  rack: string;
  levels: LocationLevelProps[];
}

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

export interface LocationAisleProps {
  aisle: string;
  racks: LocationRackProps[];
}

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

  get layout(): LocationAisle[] {
    return this.aisles.map((aisle) => aisle.clone());
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.metadataValue ? { ...this.metadataValue } : undefined;
  }

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

  toJSON(): WarehouseLocationProps {
    return {
      warehouse_id: this.warehouseIdValue,
      code: this.codeValue,
      layout: this.aisles.map((aisle) => aisle.toJSON()),
      metadata: this.metadataValue ? { ...this.metadataValue } : undefined,
    };
  }
}
