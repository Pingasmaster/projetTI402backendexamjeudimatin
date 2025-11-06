export interface LocationLevel {
  level: number;
  bins: string[];
}

export interface LocationRack {
  rack: string;
  levels: LocationLevel[];
}

export interface LocationAisle {
  aisle: string;
  racks: LocationRack[];
}

export interface WarehouseLocation {
  warehouse_id: number;
  code: string;
  layout: LocationAisle[];
  metadata?: Record<string, unknown>;
}
