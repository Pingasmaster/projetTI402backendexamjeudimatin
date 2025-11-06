import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { ProductService } from "../src/services/productService";
import { Product } from "../src/models/product";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Product routes", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requires authentication", async () => {
    const listSpy = jest.spyOn(ProductService.prototype, "listProducts");
    const response = await request(app).get("/products");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("lists products", async () => {
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

    const response = await request(app)
      .get("/products")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("validates product creation payload", async () => {
    const createSpy = jest.spyOn(ProductService.prototype, "createProduct");
    const response = await request(app)
      .post("/products")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates a product", async () => {
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

  it("updates a product", async () => {
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

  it("propagates product update errors", async () => {
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

  it("deletes a product", async () => {
    const deleteSpy = jest
      .spyOn(ProductService.prototype, "deleteProduct")
      .mockResolvedValue();

    const response = await request(app)
      .delete("/products/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith(5);
  });

  it("propagates product deletion errors", async () => {
    jest.spyOn(ProductService.prototype, "deleteProduct").mockRejectedValue(
      new AppError("Produit introuvable", 404),
    );

    const response = await request(app)
      .delete("/products/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Produit introuvable");
  });
});
