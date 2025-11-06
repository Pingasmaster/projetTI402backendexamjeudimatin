import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import * as locationService from "../src/services/locationService";
import { AppError } from "../src/middlewares/errorHandler";

jest.mock("../src/services/locationService");

const mockedLocationService = locationService as jest.Mocked<typeof locationService>;

const authHeader = () =>
  `Bearer ${signToken({
    sub: "admin",
    email: process.env.ADMIN_EMAIL as string,
    role: "admin",
  })}`;

describe("Location routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unauthenticated access to warehouse layout", async () => {
    const response = await request(app).get("/warehouses/1/locations");

    expect(response.status).toBe(401);
    expect(mockedLocationService.getWarehouseLocation).not.toHaveBeenCalled();
  });

  it("returns warehouse layout when present", async () => {
    mockedLocationService.getWarehouseLocation.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: true },
    });

    const response = await request(app)
      .get("/warehouses/1/locations")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("WHS-001");
    expect(mockedLocationService.getWarehouseLocation).toHaveBeenCalledWith(1);
  });

  it("returns 404 when layout is missing", async () => {
    mockedLocationService.getWarehouseLocation.mockResolvedValue(null);

    const response = await request(app)
      .get("/warehouses/99/locations")
      .set("Authorization", authHeader());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Configuration introuvable pour cet entrepôt");
  });

  it("validates warehouse identifier", async () => {
    const response = await request(app)
      .get("/warehouses/not-a-number/locations")
      .set("Authorization", authHeader());

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
  });

  it("creates warehouse layout", async () => {
    mockedLocationService.createWarehouseLocation.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [
        {
          aisle: "A1",
          racks: [
            {
              rack: "R1",
              levels: [
                {
                  level: 1,
                  bins: ["A1-R1-L1-B01"],
                },
              ],
            },
          ],
        },
      ],
    });

    const payload = {
      code: "WHS-001",
      layout: [
        {
          aisle: "A1",
          racks: [
            {
              rack: "R1",
              levels: [
                {
                  level: 1,
                  bins: ["A1-R1-L1-B01"],
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await request(app)
      .post("/warehouses/1/locations")
      .set("Authorization", authHeader())
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.code).toBe("WHS-001");
    expect(mockedLocationService.createWarehouseLocation).toHaveBeenCalledWith(1, payload);
  });

  it("propagates creation conflicts", async () => {
    mockedLocationService.createWarehouseLocation.mockRejectedValue(
      new AppError("La configuration existe déjà pour cet entrepôt", 409),
    );

    const response = await request(app)
      .post("/warehouses/1/locations")
      .set("Authorization", authHeader())
      .send({
        code: "WHS-001",
        layout: [
          {
            aisle: "A1",
            racks: [
              {
                rack: "R1",
                levels: [
                  {
                    level: 1,
                    bins: ["A1-R1-L1-B01"],
                  },
                ],
              },
            ],
          },
        ],
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("La configuration existe déjà pour cet entrepôt");
  });

  it("updates warehouse layout", async () => {
    mockedLocationService.updateWarehouseLocation.mockResolvedValue({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: false },
    });

    const response = await request(app)
      .put("/warehouses/1/locations")
      .set("Authorization", authHeader())
      .send({ metadata: { tempControlled: false } });

    expect(response.status).toBe(200);
    expect(response.body.metadata.tempControlled).toBe(false);
    expect(mockedLocationService.updateWarehouseLocation).toHaveBeenCalledWith(1, {
      metadata: { tempControlled: false },
    });
  });

  it("propagates update errors", async () => {
    mockedLocationService.updateWarehouseLocation.mockRejectedValue(
      new AppError("Configuration introuvable pour cet entrepôt", 404),
    );

    const response = await request(app)
      .put("/warehouses/99/locations")
      .set("Authorization", authHeader())
      .send({ metadata: { tempControlled: true } });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Configuration introuvable pour cet entrepôt");
  });

  it("checks if a bin exists", async () => {
    mockedLocationService.binExists.mockResolvedValue(true);

    const response = await request(app)
      .get("/locations/A1-R1-L1-B01/exists")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      binCode: "A1-R1-L1-B01",
      exists: true,
    });
    expect(mockedLocationService.binExists).toHaveBeenCalledWith("A1-R1-L1-B01");
  });
});
