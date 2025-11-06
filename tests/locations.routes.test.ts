// Ce fichier garantit que les routes de cartographie répondent correctement.
import request from "supertest";
import app from "../src/app";
import { signToken } from "../src/utils/jwt";
import { LocationService } from "../src/services/locationService";
import {
  WarehouseLocation,
  WarehouseLocationCreateProps,
} from "../src/models/location";
import { AppError } from "../src/middlewares/errorHandler";

const authHeader = () =>
  `Bearer ${signToken({
    sub: "1",
    username: "tester",
    role: "user",
  })}`;

describe("Routes de cartographie", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renvoie la cartographie lorsque disponible", async () => {
    const getSpy = jest
      .spyOn(LocationService.prototype, "getWarehouseLocation")
      .mockResolvedValue(
        WarehouseLocation.fromDatabase({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: true },
        }),
      );

    const response = await request(app).get("/warehouses/1/locations");

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("WHS-001");
    expect(getSpy).toHaveBeenCalledWith(1);
  });

  it("renvoie 404 quand la cartographie manque", async () => {
    jest
      .spyOn(LocationService.prototype, "getWarehouseLocation")
      .mockResolvedValue(null);

    const response = await request(app).get("/warehouses/99/locations");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Configuration introuvable pour cet entrepôt");
  });

  it("valide l'identifiant d'entrepôt", async () => {
    const response = await request(app).get(
      "/warehouses/not-a-number/locations",
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
  });

  it("exige une authentification pour créer une cartographie", async () => {
    const createSpy = jest.spyOn(
      LocationService.prototype,
      "createWarehouseLocation",
    );
    const response = await request(app).post("/warehouses/1/locations").send({
      code: "WHS-001",
      layout: [],
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Non autorisé");
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("crée une cartographie d'entrepôt", async () => {
    const layoutPayload: WarehouseLocationCreateProps = {
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

    const createSpy = jest
      .spyOn(LocationService.prototype, "createWarehouseLocation")
      .mockResolvedValue(WarehouseLocation.create(1, layoutPayload));

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
    expect(createSpy).toHaveBeenCalledWith(1, payload);
  });

  it("propage les conflits de création", async () => {
    jest
      .spyOn(LocationService.prototype, "createWarehouseLocation")
      .mockRejectedValue(
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

  it("met à jour la cartographie d'entrepôt", async () => {
    const updateSpy = jest
      .spyOn(LocationService.prototype, "updateWarehouseLocation")
      .mockResolvedValue(
        WarehouseLocation.fromDatabase({
      warehouse_id: 1,
      code: "WHS-001",
      layout: [],
      metadata: { tempControlled: false },
        }),
      );

    const response = await request(app)
      .put("/warehouses/1/locations")
      .set("Authorization", authHeader())
      .send({ metadata: { tempControlled: false } });

    expect(response.status).toBe(200);
    expect(response.body.metadata.tempControlled).toBe(false);
    expect(updateSpy).toHaveBeenCalledWith(1, {
      metadata: { tempControlled: false },
    });
  });

  it("propage les erreurs de mise à jour", async () => {
    jest
      .spyOn(LocationService.prototype, "updateWarehouseLocation")
      .mockRejectedValue(
      new AppError("Configuration introuvable pour cet entrepôt", 404),
    );

    const response = await request(app)
      .put("/warehouses/99/locations")
      .set("Authorization", authHeader())
      .send({ metadata: { tempControlled: true } });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Configuration introuvable pour cet entrepôt");
  });

  it("vérifie l'existence d'un emplacement", async () => {
    const existsSpy = jest
      .spyOn(LocationService.prototype, "binExists")
      .mockResolvedValue(true);

    const response = await request(app).get("/locations/A1-R1-L1-B01/exists");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      binCode: "A1-R1-L1-B01",
      exists: true,
    });
    expect(existsSpy).toHaveBeenCalledWith("A1-R1-L1-B01");
  });
});
