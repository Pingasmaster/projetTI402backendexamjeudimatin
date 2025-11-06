import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import * as warehouseService from "../src/services/warehouseService";
import { AppError } from "../src/middlewares/errorHandler";

jest.mock("../src/services/warehouseService");

const mockedWarehouseService = warehouseService as jest.Mocked<typeof warehouseService>;

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Warehouse routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/warehouses");

    expect(response.status).toBe(401);
    expect(mockedWarehouseService.listWarehouses).not.toHaveBeenCalled();
  });

  it("lists warehouses", async () => {
    mockedWarehouseService.listWarehouses.mockResolvedValue([
      {
        id: 1,
        name: "Entrepôt Paris",
        location: "Paris",
        created_at: undefined,
        updated_at: undefined,
      },
    ]);

    const response = await request(app)
      .get("/warehouses")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("retrieves a warehouse by id", async () => {
    mockedWarehouseService.getWarehouse.mockResolvedValue({
      id: 2,
      name: "Entrepôt Lyon",
      location: "Lyon",
      created_at: undefined,
      updated_at: undefined,
    });

    const response = await request(app)
      .get("/warehouses/2")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Entrepôt Lyon");
    expect(mockedWarehouseService.getWarehouse).toHaveBeenCalledWith(2);
  });

  it("returns 404 when warehouse is missing", async () => {
    mockedWarehouseService.getWarehouse.mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .get("/warehouses/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });

  it("validates warehouse creation payload", async () => {
    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(mockedWarehouseService.createWarehouse).not.toHaveBeenCalled();
  });

  it("creates a warehouse", async () => {
    mockedWarehouseService.createWarehouse.mockResolvedValue({
      id: 3,
      name: "Entrepôt Marseille",
      location: "Marseille",
      created_at: undefined,
      updated_at: undefined,
    });

    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", authHeader())
      .send({ name: "Entrepôt Marseille", location: "Marseille" });

    expect(response.status).toBe(201);
    expect(response.body.location).toBe("Marseille");
    expect(mockedWarehouseService.createWarehouse).toHaveBeenCalledWith({
      name: "Entrepôt Marseille",
      location: "Marseille",
    });
  });

  it("updates a warehouse", async () => {
    mockedWarehouseService.updateWarehouse.mockResolvedValue({
      id: 4,
      name: "Entrepôt Lille",
      location: "Lille",
      created_at: undefined,
      updated_at: undefined,
    });

    const response = await request(app)
      .put("/warehouses/4")
      .set("Authorization", authHeader())
      .send({ name: "Entrepôt Lille" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Entrepôt Lille");
    expect(mockedWarehouseService.updateWarehouse).toHaveBeenCalledWith(4, { name: "Entrepôt Lille" });
  });

  it("propagates update errors", async () => {
    mockedWarehouseService.updateWarehouse.mockRejectedValue(
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
    mockedWarehouseService.deleteWarehouse.mockResolvedValue();

    const response = await request(app)
      .delete("/warehouses/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(204);
    expect(mockedWarehouseService.deleteWarehouse).toHaveBeenCalledWith(5);
  });

  it("propagates deletion errors", async () => {
    mockedWarehouseService.deleteWarehouse.mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .delete("/warehouses/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });
});
