import { AppError } from "../src/middlewares/errorHandler";
import { LocationService } from "../src/services/locationService";

jest.mock("../src/config/mongo", () => ({
  getMongoDb: jest.fn(),
}));

import { getMongoDb } from "../src/config/mongo";

const getMongoDbMock = getMongoDb as unknown as jest.Mock;
const collectionMock = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
};
let service: LocationService;

describe("Service locationService", () => {
  beforeEach(() => {
    getMongoDbMock.mockReset();
    collectionMock.findOne.mockReset();
    collectionMock.insertOne.mockReset();
    collectionMock.updateOne.mockReset();

    getMongoDbMock.mockResolvedValue({
      collection: () => collectionMock,
    });

    service = new LocationService(getMongoDb as unknown as any);
  });

  it("récupère une configuration d'entrepôt", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
    });

    const location = await service.getWarehouseLocation(1);

    expect(location?.code).toBe("WHS-001");
    expect(collectionMock.findOne).toHaveBeenCalledWith({ warehouse_id: 1 });
  });

  it("crée une configuration lorsqu'il n'en existe pas", async () => {
    collectionMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(undefined); // not used further
    collectionMock.insertOne.mockResolvedValue({ acknowledged: true });

    const payload = {
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: true },
    };

    const created = await service.createWarehouseLocation(1, payload);

    expect(created.code).toBe("WHS-001");
    expect(collectionMock.insertOne).toHaveBeenCalledWith({
      warehouse_id: 1,
      ...payload,
    });
  });

  it("refuse la création si la configuration existe déjà", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
    });

    await expect(
      service.createWarehouseLocation(1, { code: "WHS-001", layout: [] }),
    ).rejects.toThrow(AppError);
  });

  it("met à jour une configuration existante", async () => {
    collectionMock.findOne
      .mockResolvedValueOnce({
        warehouse_id: 1,
        code: "WHS-001",
        layout: [],
        metadata: { tempControlled: true },
      })
      .mockResolvedValueOnce({
        warehouse_id: 1,
        code: "WHS-001",
        layout: [],
        metadata: { tempControlled: false },
      });

    collectionMock.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const updated = await service.updateWarehouseLocation(1, {
      metadata: { tempControlled: false },
    });

    expect(updated?.metadata?.tempControlled).toBe(false);
    expect(collectionMock.updateOne).toHaveBeenCalledWith(
      { warehouse_id: 1 },
      { $set: { metadata: { tempControlled: false } } },
    );
  });

  it("lève une erreur quand la configuration est absente", async () => {
    collectionMock.findOne.mockResolvedValueOnce(null);

    await expect(
      service.updateWarehouseLocation(99, { metadata: { tempControlled: true } }),
    ).rejects.toThrow(AppError);
  });

  it("vérifie l'existence d'un emplacement", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
    });

    const exists = await service.binExists("A1-R1-L1-B01");

    expect(exists).toBe(true);
    expect(collectionMock.findOne).toHaveBeenCalledWith({
      layout: {
        $elemMatch: {
          racks: {
            $elemMatch: {
              levels: {
                $elemMatch: {
                  bins: "A1-R1-L1-B01",
                },
              },
            },
          },
        },
      },
    });
  });
});
