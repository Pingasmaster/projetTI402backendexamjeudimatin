import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { WarehouseService } from "../src/services/warehouseService";
import { Warehouse } from "../src/models/warehouse";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Warehouse routes", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requires authentication", async () => {
    const listSpy = jest.spyOn(WarehouseService.prototype, "listWarehouses");
    const response = await request(app).get("/warehouses");

    expect(response.status).toBe(401);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("lists warehouses", async () => {
    const listSpy = jest
      .spyOn(WarehouseService.prototype, "listWarehouses")
      .mockResolvedValue([
        Warehouse.fromDatabase({
        id: 1,
        name: "Entrepôt Paris",
        location: "Paris",
        created_at: undefined,
        updated_at: undefined,
        }),
    ]);

    const response = await request(app)
      .get("/warehouses")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("retrieves a warehouse by id", async () => {
    const getSpy = jest
      .spyOn(WarehouseService.prototype, "getWarehouse")
      .mockResolvedValue(
        Warehouse.fromDatabase({
      id: 2,
      name: "Entrepôt Lyon",
      location: "Lyon",
      created_at: undefined,
      updated_at: undefined,
        }),
      );

    const response = await request(app)
      .get("/warehouses/2")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Entrepôt Lyon");
    expect(getSpy).toHaveBeenCalledWith(2);
  });

  it("returns 404 when warehouse is missing", async () => {
    jest.spyOn(WarehouseService.prototype, "getWarehouse").mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .get("/warehouses/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });

  it("validates warehouse creation payload", async () => {
    const createSpy = jest.spyOn(WarehouseService.prototype, "createWarehouse");
    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates a warehouse", async () => {
    const createSpy = jest
      .spyOn(WarehouseService.prototype, "createWarehouse")
      .mockResolvedValue(
        Warehouse.fromDatabase({
      id: 3,
      name: "Entrepôt Marseille",
      location: "Marseille",
      created_at: undefined,
      updated_at: undefined,
        }),
      );

    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", authHeader())
      .send({ name: "Entrepôt Marseille", location: "Marseille" });

    expect(response.status).toBe(201);
    expect(response.body.location).toBe("Marseille");
    expect(createSpy).toHaveBeenCalledWith({
      name: "Entrepôt Marseille",
      location: "Marseille",
    });
  });

  it("updates a warehouse", async () => {
    const updateSpy = jest
      .spyOn(WarehouseService.prototype, "updateWarehouse")
      .mockResolvedValue(
        Warehouse.fromDatabase({
      id: 4,
      name: "Entrepôt Lille",
      location: "Lille",
      created_at: undefined,
      updated_at: undefined,
        }),
      );

    const response = await request(app)
      .put("/warehouses/4")
      .set("Authorization", authHeader())
      .send({ name: "Entrepôt Lille" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Entrepôt Lille");
    expect(updateSpy).toHaveBeenCalledWith(4, { name: "Entrepôt Lille" });
  });

  it("propagates update errors", async () => {
    jest.spyOn(WarehouseService.prototype, "updateWarehouse").mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .put("/warehouses/999")
      .set("Authorization", authHeader())
      .send({ location: "Metz" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });

  it("deletes a warehouse", async () => {
    const deleteSpy = jest
      .spyOn(WarehouseService.prototype, "deleteWarehouse")
      .mockResolvedValue();

    const response = await request(app)
      .delete("/warehouses/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith(5);
  });

  it("propagates deletion errors", async () => {
    jest
      .spyOn(WarehouseService.prototype, "deleteWarehouse")
      .mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .delete("/warehouses/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });
});
