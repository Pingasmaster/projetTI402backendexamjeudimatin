import { getMongoDb } from "../config/mongo";
import { WarehouseLocation } from "../models/location";
import { AppError } from "../middlewares/errorHandler";

const collectionName = "locations";

export const getWarehouseLocation = async (
  warehouseId: number,
): Promise<WarehouseLocation | null> => {
  const db = await getMongoDb();
  return db.collection<WarehouseLocation>(collectionName).findOne({ warehouse_id: warehouseId });
};

export const createWarehouseLocation = async (
  warehouseId: number,
  location: Omit<WarehouseLocation, "warehouse_id">,
): Promise<WarehouseLocation> => {
  const db = await getMongoDb();
  const existing = await db.collection<WarehouseLocation>(collectionName).findOne({
    warehouse_id: warehouseId,
  });

  if (existing) {
    throw new AppError("La configuration existe déjà pour cet entrepôt", 409);
  }

  const payload: WarehouseLocation = {
    warehouse_id: warehouseId,
    ...location,
  };

  await db.collection<WarehouseLocation>(collectionName).insertOne(payload);
  return payload;
};

export const updateWarehouseLocation = async (
  warehouseId: number,
  location: Partial<WarehouseLocation>,
): Promise<WarehouseLocation> => {
  const db = await getMongoDb();
  const collection = db.collection<WarehouseLocation>(collectionName);
  const existing = await collection.findOne({ warehouse_id: warehouseId });

  if (!existing) {
    throw new AppError("Configuration introuvable pour cet entrepôt", 404);
  }

  await collection.updateOne({ warehouse_id: warehouseId }, { $set: location });

  const updated = await collection.findOne({ warehouse_id: warehouseId });

  if (!updated) {
    throw new AppError("Configuration introuvable pour cet entrepôt", 404);
  }

  return updated;
};

export const binExists = async (binCode: string): Promise<boolean> => {
  const db = await getMongoDb();
  const result = await db.collection<WarehouseLocation>(collectionName).findOne({
    layout: {
      $elemMatch: {
        racks: {
          $elemMatch: {
            levels: {
              $elemMatch: {
                bins: binCode,
              },
            },
          },
        },
      },
    },
  });

  return Boolean(result);
};
