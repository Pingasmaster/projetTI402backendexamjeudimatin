import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/user";

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

const expiresIn = "1h";

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
