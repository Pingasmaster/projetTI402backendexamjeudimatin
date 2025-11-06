import { AppError } from "../src/middlewares/errorHandler";
import { ProductService } from "../src/services/productService";

jest.mock("../src/config/postgres", () => ({
  postgresPool: {
    query: jest.fn(),
  },
}));

import { postgresPool } from "../src/config/postgres";

const queryMock = postgresPool.query as jest.Mock;
let service: ProductService;

describe("productService", () => {
  beforeEach(() => {
    queryMock.mockReset();
    service = new ProductService(postgresPool as unknown as any);
  });

  it("fetches products ordered by id", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          id: 1,
          name: "Carton",
          reference: "SKU-001",
          quantity: 10,
          warehouse_id: 1,
        },
      ],
    });

    const products = await service.listProducts();

    expect(products).toHaveLength(1);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM products ORDER BY id ASC",
    );
  });

  it("creates a product", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          id: 2,
          name: "Palette",
          reference: "SKU-002",
          quantity: 5,
          warehouse_id: 1,
        },
      ],
    });

    const product = await service.createProduct({
      name: "Palette",
      reference: "SKU-002",
      quantity: 5,
      warehouse_id: 1,
    });

    expect(product.id).toBe(2);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO products"),
      ["Palette", "SKU-002", 5, 1],
    );
  });

  it("updates provided fields", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 3,
          name: "Palette Plastique",
          reference: "SKU-003",
          quantity: 9,
          warehouse_id: 1,
        },
      ],
    });

    const updated = await service.updateProduct(3, { quantity: 9 });

    expect(updated.quantity).toBe(9);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE products"),
      [9, 3],
    );
  });

  it("returns existing product when no updates were provided", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 5,
          name: "Chariot",
          reference: "SKU-005",
          quantity: 1,
          warehouse_id: 2,
        },
      ],
    });

    const product = await service.updateProduct(5, {});

    expect(product.id).toBe(5);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM products WHERE id = $1",
      [5],
    );
  });

  it("throws when product to refresh does not exist", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(service.updateProduct(999, {})).rejects.toThrow(AppError);
  });

  it("throws when update does not affect any product", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(
      service.updateProduct(6, { name: "Updated Box" }),
    ).rejects.toThrow(AppError);
  });

  it("deletes an existing product", async () => {
    queryMock.mockResolvedValue({
      rowCount: 1,
    });

    await service.deleteProduct(4);

    expect(queryMock).toHaveBeenCalledWith(
      "DELETE FROM products WHERE id = $1",
      [4],
    );
  });

  it("throws when deleting a missing product", async () => {
    queryMock.mockResolvedValue({
      rowCount: 0,
    });

    await expect(service.deleteProduct(999)).rejects.toThrow(AppError);
});
});
