import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { MovementService } from "../src/services/movementService";
import { Movement } from "../src/models/movement";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = () =>
  `Bearer ${signToken({
    sub: "1",
    username: "tester",
    role: "user",
  })}`;

describe("Routes mouvements", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exige une authentification pour créer un mouvement", async () => {
    const createSpy = jest.spyOn(MovementService.prototype, "createMovement");
    const response = await request(app).post("/movements").send({
      type: "IN",
      quantity: 5,
      product_id: 2,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("liste les mouvements", async () => {
    const listSpy = jest
      .spyOn(MovementService.prototype, "listMovements")
      .mockResolvedValue([
      Movement.fromDatabase({
        id: 1,
        type: "IN",
        quantity: 5,
        product_id: 3,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
      }),
    ]);

    const response = await request(app).get("/movements");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("valide la charge utile de création de mouvement", async () => {
    const createSpy = jest.spyOn(MovementService.prototype, "createMovement");
    const response = await request(app)
      .post("/movements")
      .set("Authorization", authHeader())
      .send({ type: "UP", quantity: 10 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("crée un mouvement", async () => {
    const createdAt = new Date("2024-02-02T10:00:00.000Z");
    const createSpy = jest
      .spyOn(MovementService.prototype, "createMovement")
      .mockResolvedValue(
        Movement.fromDatabase({
          id: 2,
          type: "OUT",
          quantity: 3,
          product_id: 1,
          created_at: createdAt,
        }),
      );

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
    expect(createSpy).toHaveBeenCalledWith({
      type: "OUT",
      quantity: 3,
      product_id: 1,
    });
  });

  it("renvoie les erreurs métier du service", async () => {
    jest.spyOn(MovementService.prototype, "createMovement").mockRejectedValue(
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
