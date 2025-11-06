import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import * as productService from "../src/services/productService";
import { AppError } from "../src/middlewares/errorHandler";

jest.mock("../src/services/productService");

const mockedProductService = productService as jest.Mocked<typeof productService>;

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Product routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/products");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(mockedProductService.listProducts).not.toHaveBeenCalled();
  });

  it("lists products", async () => {
    mockedProductService.listProducts.mockResolvedValue([
      {
        id: 1,
        name: "Carton",
        reference: "SKU-001",
        quantity: 10,
        warehouse_id: 1,
        created_at: undefined,
        updated_at: undefined,
      },
    ]);

    const response = await request(app)
      .get("/products")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(mockedProductService.listProducts).toHaveBeenCalledTimes(1);
  });

  it("validates product creation payload", async () => {
    const response = await request(app)
      .post("/products")
      .set("Authorization", authHeader())
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
    expect(mockedProductService.createProduct).not.toHaveBeenCalled();
  });

  it("creates a product", async () => {
    mockedProductService.createProduct.mockResolvedValue({
      id: 2,
      name: "Palette Europe",
      reference: "SKU-002",
      quantity: 50,
      warehouse_id: 1,
      created_at: undefined,
      updated_at: undefined,
    });

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
    expect(mockedProductService.createProduct).toHaveBeenCalledWith({
      name: "Palette Europe",
      reference: "SKU-002",
      quantity: 50,
      warehouse_id: 1,
    });
  });

  it("updates a product", async () => {
    mockedProductService.updateProduct.mockResolvedValue({
      id: 3,
      name: "Palette Plastique",
      reference: "SKU-003",
      quantity: 12,
      warehouse_id: 2,
      created_at: undefined,
      updated_at: undefined,
    });

    const response = await request(app)
      .put("/products/3")
      .set("Authorization", authHeader())
      .send({ quantity: 12 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(12);
    expect(mockedProductService.updateProduct).toHaveBeenCalledWith(3, { quantity: 12 });
  });

  it("propagates product update errors", async () => {
    mockedProductService.updateProduct.mockRejectedValue(
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
    mockedProductService.deleteProduct.mockResolvedValue();

    const response = await request(app)
      .delete("/products/5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(204);
    expect(mockedProductService.deleteProduct).toHaveBeenCalledWith(5);
  });

  it("propagates product deletion errors", async () => {
    mockedProductService.deleteProduct.mockRejectedValue(
      new AppError("Produit introuvable", 404),
    );

    const response = await request(app)
      .delete("/products/999")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Produit introuvable");
  });
});
