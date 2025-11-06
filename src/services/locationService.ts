// service cartographie des entrepôts
import { Collection, Db } from "mongodb";
import { getMongoDb } from "../config/mongo";
import {
  WarehouseLocation,
  WarehouseLocationCreateProps,
  WarehouseLocationProps,
  WarehouseLocationUpdateProps,
} from "../models/location";
import { AppError } from "../middlewares/errorHandler";

const collectionName = "locations";

type DbFactory = () => Promise<Db>;

// service responsable de la configuration et de la validation des emplacements des entrepôt persistants dans MongoDB
export class LocationService {
  constructor(private readonly dbFactory: DbFactory = getMongoDb) {}

  // obtient la collection MongoDB avec les configurations d'emplacements
  private async getCollection(): Promise<
    Collection<WarehouseLocationProps>
  > {
    const db = await this.dbFactory();
    return db.collection<WarehouseLocationProps>(collectionName);
  }

  // retourne la configuration d'emplacement pour l'entrepôt
  async getWarehouseLocation(
    warehouseId: number,
  ): Promise<WarehouseLocation | null> {
    const collection = await this.getCollection();
    const record = await collection.findOne({ warehouse_id: warehouseId });
    return record ? WarehouseLocation.fromDatabase(record) : null;
  }

  // crée la configuration d'un entrepôt si elle n'existe pas déjà
  async createWarehouseLocation(
    warehouseId: number,
    location: WarehouseLocationCreateProps,
  ): Promise<WarehouseLocation> {
    const collection = await this.getCollection();
    const existing = await collection.findOne({ warehouse_id: warehouseId });

    if (existing) {
      throw new AppError("La configuration existe déjà pour cet entrepôt", 409);
    }

    const payload = WarehouseLocation.create(warehouseId, location);

    await collection.insertOne(payload.toJSON());

    return payload;
  }

  // mets à jour la configuration d'emplacement d'un entrepôt existant
  async updateWarehouseLocation(
    warehouseId: number,
    updates: WarehouseLocationUpdateProps,
  ): Promise<WarehouseLocation> {
    const collection = await this.getCollection();
    const existingRecord = await collection.findOne({ warehouse_id: warehouseId });

    if (!existingRecord) {
      throw new AppError("Configuration introuvable pour cet entrepôt", 404);
    }

    await collection.updateOne(
      { warehouse_id: warehouseId },
      { $set: updates },
    );

    const updatedRecord = await collection.findOne({ warehouse_id: warehouseId });

    if (!updatedRecord) {
      throw new AppError("Configuration introuvable pour cet entrepôt", 404);
    }

    return WarehouseLocation.fromDatabase(updatedRecord);
  }

  // vérifie si un bin existe dans l'ensemble des racks
  async binExists(binCode: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.findOne({
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
  }
}
