import { AppError } from "../src/middlewares/errorHandler";
import { listMovements, createMovement } from "../src/services/movementService";

jest.mock("../src/config/postgres", () => ({
  postgresPool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

import { postgresPool } from "../src/config/postgres";

const poolQueryMock = postgresPool.query as jest.Mock;
const connectMock = postgresPool.connect as jest.Mock;

describe("movementService", () => {
  beforeEach(() => {
    poolQueryMock.mockReset();
    connectMock.mockReset();
  });

  it("retrieves movements ordered by creation date", async () => {
    poolQueryMock.mockResolvedValue({
      rows: [
        {
          id: 1,
          type: "IN",
          quantity: 10,
          product_id: 2,
          created_at: new Date("2024-01-01T00:00:00.000Z"),
        },
      ],
    });

    const movements = await listMovements();

    expect(movements).toHaveLength(1);
    expect(poolQueryMock).toHaveBeenCalledWith(
      "SELECT * FROM movements ORDER BY created_at DESC",
    );
  });

  it("creates an inbound movement and updates stock", async () => {
    const clientQueryMock = jest.fn();
    const releaseMock = jest.fn();
    connectMock.mockResolvedValue({
      query: clientQueryMock,
      release: releaseMock,
    });

    clientQueryMock
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 5, quantity: 10 }],
      }) // SELECT
      .mockResolvedValueOnce(undefined) // UPDATE
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 1,
            type: "IN",
            quantity: 5,
            product_id: 5,
            created_at: new Date("2024-01-02T00:00:00.000Z"),
          },
        ],
      }) // INSERT
      .mockResolvedValueOnce(undefined); // COMMIT

    const movement = await createMovement({
      type: "IN",
      quantity: 5,
      product_id: 5,
    });

    expect(movement.type).toBe("IN");
    expect(clientQueryMock).toHaveBeenNthCalledWith(3, "UPDATE products SET quantity = $1 WHERE id = $2", [
      15,
      5,
    ]);
    expect(clientQueryMock).toHaveBeenNthCalledWith(5, "COMMIT");
    expect(releaseMock).toHaveBeenCalled();
  });

  it("rejects outbound movement when stock is insufficient", async () => {
    const clientQueryMock = jest.fn();
    const releaseMock = jest.fn();
    connectMock.mockResolvedValue({
      query: clientQueryMock,
      release: releaseMock,
    });

    clientQueryMock
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 2, quantity: 1 }],
      }) // SELECT
      .mockResolvedValue(undefined); // ROLLBACK (default)

    await expect(
      createMovement({
        type: "OUT",
        quantity: 5,
        product_id: 2,
      }),
    ).rejects.toThrow(AppError);

    expect(clientQueryMock).toHaveBeenNthCalledWith(3, "ROLLBACK");
    expect(releaseMock).toHaveBeenCalled();
  });

  it("rejects movements for unknown products", async () => {
    const clientQueryMock = jest.fn();
    const releaseMock = jest.fn();
    connectMock.mockResolvedValue({
      query: clientQueryMock,
      release: releaseMock,
    });

    clientQueryMock
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      }) // SELECT
      .mockResolvedValue(undefined); // ROLLBACK

    await expect(
      createMovement({
        type: "IN",
        quantity: 5,
        product_id: 999,
      }),
    ).rejects.toThrow(AppError);

    expect(clientQueryMock).toHaveBeenNthCalledWith(3, "ROLLBACK");
    expect(releaseMock).toHaveBeenCalled();
  });
});
