import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { WarehouseService } from "../src/services/warehouseService";
import { Warehouse } from "../src/models/warehouse";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = (role: "user" | "admin" = "user") =>
  `Bearer ${signToken({
    sub: "1",
    username: `${role}-tester`,
    role,
  })}`;

describe("Routes entrepôts", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exige une authentification pour créer un entrepôt", async () => {
    const createSpy = jest.spyOn(WarehouseService.prototype, "createWarehouse");
    const response = await request(app).post("/warehouses").send({
      name: "Entrepôt Paris",
      location: "Paris",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("liste les entrepôts sans jeton", async () => {
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

    const response = await request(app).get("/warehouses");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("récupère un entrepôt par identifiant", async () => {
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

    const response = await request(app).get("/warehouses/2");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Entrepôt Lyon");
    expect(getSpy).toHaveBeenCalledWith(2);
  });

  it("retourne 404 lorsque l'entrepôt est absent", async () => {
    jest.spyOn(WarehouseService.prototype, "getWarehouse").mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app).get("/warehouses/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });

  it("valide la charge utile de création d'entrepôt", async () => {
    const createSpy = jest.spyOn(WarehouseService.prototype, "createWarehouse");
    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("crée un entrepôt", async () => {
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

  it("met à jour un entrepôt", async () => {
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

  it("propage les erreurs de mise à jour", async () => {
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

  it("supprime un entrepôt", async () => {
    const deleteSpy = jest
      .spyOn(WarehouseService.prototype, "deleteWarehouse")
      .mockResolvedValue();

    const response = await request(app)
      .delete("/warehouses/5")
      .set("Authorization", authHeader("admin"));

    expect(response.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith(5);
  });

  it("refuse la suppression pour un profil non admin", async () => {
    const deleteSpy = jest.spyOn(WarehouseService.prototype, "deleteWarehouse");

    const response = await request(app)
      .delete("/warehouses/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Accès interdit");
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("propage les erreurs de suppression", async () => {
    jest
      .spyOn(WarehouseService.prototype, "deleteWarehouse")
      .mockRejectedValue(
      new AppError("Entrepôt introuvable", 404),
    );

    const response = await request(app)
      .delete("/warehouses/999")
      .set("Authorization", authHeader("admin"));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Entrepôt introuvable");
  });
});
