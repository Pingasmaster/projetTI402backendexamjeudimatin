import request from "supertest";
import app from "../src/app";

describe("Auth routes", () => {
  it("returns a JWT for valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
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

  it("rejects invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "wrong@stocklink.local",
        password: "nope",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Identifiants invalides",
      }),
    );
  });

  it("validates required credentials payload", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Données invalides",
        details: "Email et mot de passe sont requis",
      }),
    );
  });
});

describe("System routes", () => {
  it("reports API health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
