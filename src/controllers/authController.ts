import { Request, Response } from "express";
import { env } from "../config/env";
import { signToken } from "../utils/jwt";

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({
      message: "Données invalides",
      details: "Email et mot de passe sont requis",
    });
  }

  if (email !== env.adminCredentials.email || password !== env.adminCredentials.password) {
    return res.status(401).json({
      message: "Identifiants invalides",
    });
  }

  const token = signToken({
    sub: "admin",
    email,
    role: "admin",
  });

  res.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
  });
};
