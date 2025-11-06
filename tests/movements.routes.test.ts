import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import * as movementService from "../src/services/movementService";
import { AppError } from "../src/middlewares/errorHandler";

jest.mock("../src/services/movementService");

const mockedMovementService = movementService as jest.Mocked<typeof movementService>;

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Movement routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/movements");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
  });

  it("lists movements", async () => {
    mockedMovementService.listMovements.mockResolvedValue([
      {
        id: 1,
        type: "IN",
        quantity: 5,
        product_id: 3,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const response = await request(app)
      .get("/movements")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(mockedMovementService.listMovements).toHaveBeenCalledTimes(1);
  });

  it("validates movement creation payload", async () => {
    const response = await request(app)
      .post("/movements")
      .set("Authorization", authHeader())
      .send({ type: "UP", quantity: 10 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
    expect(mockedMovementService.createMovement).not.toHaveBeenCalled();
  });

  it("creates a movement", async () => {
    const createdAt = new Date("2024-02-02T10:00:00.000Z");
    mockedMovementService.createMovement.mockResolvedValue({
      id: 2,
      type: "OUT",
      quantity: 3,
      product_id: 1,
      created_at: createdAt,
    });

    const response = await request(app)
      .post("/movements")
      .set("Authorization", authHeader())
      .send({ type: "OUT", quantity: 3, product_id: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 2,
        type: "OUT",
        quantity: 3,
        product_id: 1,
      }),
    );
    expect(mockedMovementService.createMovement).toHaveBeenCalledWith({
      type: "OUT",
      quantity: 3,
      product_id: 1,
    });
  });

  it("returns domain errors from the service layer", async () => {
    mockedMovementService.createMovement.mockRejectedValue(
      new AppError("Stock insuffisant pour ce mouvement", 400),
    );

    const response = await request(app)
      .post("/movements")
      .set("Authorization", authHeader())
      .send({ type: "OUT", quantity: 999, product_id: 1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Stock insuffisant pour ce mouvement");
  });
});
