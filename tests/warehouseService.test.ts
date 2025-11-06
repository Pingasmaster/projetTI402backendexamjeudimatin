import { AppError } from "../src/middlewares/errorHandler";
import { WarehouseService } from "../src/services/warehouseService";

jest.mock("../src/config/postgres", () => ({
  postgresPool: {
    query: jest.fn(),
  },
}));

import { postgresPool } from "../src/config/postgres";

const queryMock = postgresPool.query as jest.Mock;
let service: WarehouseService;

describe("Service warehouseService", () => {
  beforeEach(() => {
    queryMock.mockReset();
    service = new WarehouseService(postgresPool as unknown as any);
  });

  it("liste les entrepôts par identifiant croissant", async () => {
    queryMock.mockResolvedValue({
      rows: [
        { id: 1, name: "Entrepôt Paris", location: "Paris" },
        { id: 2, name: "Entrepôt Lyon", location: "Lyon" },
      ],
    });

    const warehouses = await service.listWarehouses();
    expect(warehouses).toHaveLength(2);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM warehouses ORDER BY id ASC",
    );
  });

  it("récupère un entrepôt", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 5, name: "Entrepôt Lille", location: "Lille" }],
    });

    const warehouse = await service.getWarehouse(5);
    expect(warehouse.id).toBe(5);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM warehouses WHERE id = $1",
      [5],
    );
  });

  it("lève une erreur si l'entrepôt est absent", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(service.getWarehouse(999)).rejects.toThrow(AppError);
  });

  it("crée un entrepôt", async () => {
    queryMock.mockResolvedValue({
      rows: [{ id: 10, name: "Entrepôt Marseille", location: "Marseille" }],
    });

    const warehouse = await service.createWarehouse({
      name: "Entrepôt Marseille",
      location: "Marseille",
    });

    expect(warehouse.id).toBe(10);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO warehouses"),
      ["Entrepôt Marseille", "Marseille"],
    );
  });

  it("met à jour un entrepôt", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 3, name: "Entrepôt Brest", location: "Brest" }],
    });

    const updated = await service.updateWarehouse(3, { location: "Brest" });
    expect(updated.location).toBe("Brest");
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE warehouses"),
      ["Brest", 3],
    );
  });

  it("retourne l'entrepôt existant quand rien ne change", async () => {
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 4, name: "Entrepôt Nice", location: "Nice" }],
    });

    const warehouse = await service.updateWarehouse(4, {});
    expect(warehouse.id).toBe(4);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM warehouses WHERE id = $1",
      [4],
    );
  });

  it("lève une erreur quand l'entrepôt visé manque", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(
      service.updateWarehouse(999, { name: "Ghost" }),
    ).rejects.toThrow(AppError);
  });

  it("supprime un entrepôt", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
    });

    await service.deleteWarehouse(2);
    expect(queryMock).toHaveBeenCalledWith("DELETE FROM warehouses WHERE id = $1", [2]);
  });

  it("lève une erreur si l'entrepôt à supprimer ne répond pas", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
    });

    await expect(service.deleteWarehouse(999)).rejects.toThrow(AppError);
});
});
