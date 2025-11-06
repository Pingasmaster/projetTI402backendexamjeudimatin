// Ce fichier vérifie les routes produits du point de vue d'un client.
import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { ProductService } from "../src/services/productService";
import { Product } from "../src/models/product";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = (role: "user" | "admin" = "user") =>
  `Bearer ${signToken({
    sub: "1",
    username: `${role}-tester`,
    role,
  })}`;

describe("Routes produits", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exige une authentification pour la création", async () => {
    const createSpy = jest.spyOn(ProductService.prototype, "createProduct");
    const response = await request(app).post("/products").send({
      name: "Test",
      reference: "SKU-000",
      quantity: 1,
      warehouse_id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("liste les produits sans authentification", async () => {
    const listSpy = jest
      .spyOn(ProductService.prototype, "listProducts")
      .mockResolvedValue([
        Product.fromDatabase({
          id: 1,
          name: "Carton",
          reference: "SKU-001",
          quantity: 10,
          warehouse_id: 1,
          created_at: undefined,
          updated_at: undefined,
        }),
      ]);

    const response = await request(app).get("/products");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("valide la charge utile de création de produit", async () => {
    const createSpy = jest.spyOn(ProductService.prototype, "createProduct");
    const response = await request(app)
      .post("/products")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("crée un produit", async () => {
    const createSpy = jest
      .spyOn(ProductService.prototype, "createProduct")
      .mockResolvedValue(
        Product.fromDatabase({
          id: 2,
          name: "Palette Europe",
          reference: "SKU-002",
          quantity: 50,
          warehouse_id: 1,
          created_at: undefined,
          updated_at: undefined,
        }),
      );

    const response = await request(app)
      .post("/products")
      .set("Authorization", authHeader())
      .send({
        name: "Palette Europe",
        reference: "SKU-002",
        quantity: 50,
        warehouse_id: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.reference).toBe("SKU-002");
    expect(createSpy).toHaveBeenCalledWith({
      name: "Palette Europe",
      reference: "SKU-002",
      quantity: 50,
      warehouse_id: 1,
    });
  });

  it("met à jour un produit", async () => {
    const updateSpy = jest
      .spyOn(ProductService.prototype, "updateProduct")
      .mockResolvedValue(
        Product.fromDatabase({
          id: 3,
          name: "Palette Plastique",
          reference: "SKU-003",
          quantity: 12,
          warehouse_id: 2,
          created_at: undefined,
          updated_at: undefined,
        }),
      );

    const response = await request(app)
      .put("/products/3")
      .set("Authorization", authHeader())
      .send({ quantity: 12 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(12);
    expect(updateSpy).toHaveBeenCalledWith(3, { quantity: 12 });
  });

  it("propage les erreurs de mise à jour produit", async () => {
    jest.spyOn(ProductService.prototype, "updateProduct").mockRejectedValue(
      new AppError("Produit introuvable", 404),
    );

    const response = await request(app)
      .put("/products/999")
      .set("Authorization", authHeader())
      .send({ name: "Ghost" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Produit introuvable");
  });

  it("supprime un produit", async () => {
    const deleteSpy = jest
      .spyOn(ProductService.prototype, "deleteProduct")
      .mockResolvedValue();

    const response = await request(app)
      .delete("/products/5")
      .set("Authorization", authHeader("admin"));

    expect(response.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith(5);
  });

  it("refuse la suppression pour un rôle non admin", async () => {
    const deleteSpy = jest.spyOn(ProductService.prototype, "deleteProduct");

    const response = await request(app)
      .delete("/products/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Accès interdit");
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("propage les erreurs de suppression produit", async () => {
    jest.spyOn(ProductService.prototype, "deleteProduct").mockRejectedValue(
      new AppError("Produit introuvable", 404),
    );

    const response = await request(app)
      .delete("/products/999")
      .set("Authorization", authHeader("admin"));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Produit introuvable");
  });
});
