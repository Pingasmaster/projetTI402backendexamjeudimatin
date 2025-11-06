import { AppError } from "../src/middlewares/errorHandler";
import {
  getWarehouseLocation,
  createWarehouseLocation,
  updateWarehouseLocation,
  binExists,
} from "../src/services/locationService";

const getMongoDbMock = jest.fn();
const collectionMock = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
};

jest.mock("../src/config/mongo", () => ({
  getMongoDb: getMongoDbMock,
}));

describe("locationService", () => {
  beforeEach(() => {
    getMongoDbMock.mockReset();
    collectionMock.findOne.mockReset();
    collectionMock.insertOne.mockReset();
    collectionMock.updateOne.mockReset();

    getMongoDbMock.mockResolvedValue({
      collection: () => collectionMock,
    });
  });

  it("fetches a warehouse configuration", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
    });

    const location = await getWarehouseLocation(1);

    expect(location?.code).toBe("WHS-001");
    expect(collectionMock.findOne).toHaveBeenCalledWith({ warehouse_id: 1 });
  });

  it("creates a new configuration when none exists", async () => {
    collectionMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(undefined); // not used further
    collectionMock.insertOne.mockResolvedValue({ acknowledged: true });

    const payload = {
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: true },
    };

    const created = await createWarehouseLocation(1, payload);

    expect(created.code).toBe("WHS-001");
    expect(collectionMock.insertOne).toHaveBeenCalledWith({
      warehouse_id: 1,
      ...payload,
    });
  });

  it("rejects creation when configuration already exists", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
    });

    await expect(
      createWarehouseLocation(1, { code: "WHS-001", layout: [] }),
    ).rejects.toThrow(AppError);
  });

  it("updates an existing configuration", async () => {
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

    const updated = await updateWarehouseLocation(1, {
      metadata: { tempControlled: false },
    });

    expect(updated?.metadata?.tempControlled).toBe(false);
    expect(collectionMock.updateOne).toHaveBeenCalledWith(
      { warehouse_id: 1 },
      { $set: { metadata: { tempControlled: false } } },
    );
  });

  it("throws when updating a missing configuration", async () => {
    collectionMock.findOne.mockResolvedValueOnce(null);

    await expect(
      updateWarehouseLocation(99, { metadata: { tempControlled: true } }),
    ).rejects.toThrow(AppError);
  });

  it("checks if a bin exists", async () => {
    collectionMock.findOne.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
    });

    const exists = await binExists("A1-R1-L1-B01");

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
