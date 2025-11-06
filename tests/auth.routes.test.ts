import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app";
import { UserService } from "../src/services/userService";
import { User } from "../src/models/user";

const utilisateurDeReference = User.fromDatabase({
  id: 1,
  username: "magasinier",
  password: "hashed-password",
  role: "user",
});

describe("Routes d'authentification", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("inscrit un nouvel utilisateur", async () => {
    jest
      .spyOn(UserService.prototype, "findByUsername")
      .mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password");
    const createSpy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue(utilisateurDeReference);

    const response = await request(app).post("/auth/register").send({
      username: "magasinier",
      password: "motdepasse",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      username: "magasinier",
      role: "user",
    });
    expect(createSpy).toHaveBeenCalledWith(
      { username: "magasinier", role: undefined },
      "hashed-password",
    );
  });

  it("refuse un nom d'utilisateur déjà pris", async () => {
    jest
      .spyOn(UserService.prototype, "findByUsername")
      .mockResolvedValue(utilisateurDeReference);
    const createSpy = jest.spyOn(UserService.prototype, "createUser");

    const response = await request(app).post("/auth/register").send({
      username: "magasinier",
      password: "motdepasse",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Nom d'utilisateur déjà utilisé",
      }),
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("valide la charge utile d'inscription", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "ab",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Données invalides",
      }),
    );
  });

  it("retourne un JWT lorsque les identifiants sont valides", async () => {
    jest
      .spyOn(UserService.prototype, "findByUsername")
      .mockResolvedValue(utilisateurDeReference);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    const response = await request(app).post("/auth/login").send({
      username: "magasinier",
      password: "motdepasse",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        token_type: "Bearer",
        expires_in: 3600,
      }),
    );
  });

  it("rejette des identifiants invalides", async () => {
    jest
      .spyOn(UserService.prototype, "findByUsername")
      .mockResolvedValue(utilisateurDeReference);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const response = await request(app).post("/auth/login").send({
      username: "magasinier",
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Identifiants invalides",
      }),
    );
  });

  it("valide la charge utile de connexion", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Données invalides",
      }),
    );
  });
});

describe("Routes système", () => {
  it("annonce l'état de santé de l'API", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
