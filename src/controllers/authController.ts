// gère l'inscription et la connexion
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import { UserService } from "../services/userService";
import { UserRegistrationInput } from "../models/user";

type TokenSigner = typeof signToken;

const TOKEN_LIFETIME_SECONDS = 3600;
const SALT_ROUNDS = 10;

export class AuthController {
  constructor(
    private readonly users: UserService = new UserService(),
    private readonly tokenSigner: TokenSigner = signToken,
  ) {}

  // inscrit un nouvel utilisateur
  public readonly register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body as UserRegistrationInput;

    const existing = await this.users.findByUsername(username);

    if (existing) {
      return res.status(409).json({
        message: "Nom d'utilisateur déjà utilisé",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await this.users.createUser(
      {
        username,
        role,
      },
      passwordHash,
    );

    res.status(201).json(created.toJSON());
  };

  // authentifie l'utilisateur et fournit un jeton JWT
  public readonly login = async (req: Request, res: Response) => {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    const user = await this.users.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const matches = await bcrypt.compare(password, user.password);

    if (!matches) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const token = this.tokenSigner({
      sub: String(user.id),
      username: user.username,
      role: user.role,
    });

    res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: TOKEN_LIFETIME_SECONDS,
    });
  };
}
