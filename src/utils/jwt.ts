// forge et vérifie les jetons pour protéger l'accès a l'app via JWT
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/user";

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

// durée de validité des JWT comme demandé
const expiresIn = "1h";

// signe un jeton contenant l'identité de l'utilisateur et son rôle
export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn });

// vérifie la signature et renvoie la charge utile typée
export const verifyToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
