// service d'auth utilisateur
import { Pool } from "pg";
import { postgresPool } from "../config/postgres";
import { User, UserCreateProps, UserProps } from "../models/user";

// fait la persistance des utilisateurs et récup leurs informations d'authentification
export class UserService {
  constructor(private readonly db: Pool = postgresPool) {}

  // crée un utilisateur et stocke le mot de passe déjà haché par bcrypt comme demandé
  async createUser(input: UserCreateProps, passwordHash: string): Promise<User> {
    const role = input.role ?? "user";
    const result = await this.db.query<UserProps>(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.username, passwordHash, role],
    );

    return User.fromDatabase(result.rows[0]);
  }

   // recherche un utilisateur par son nom et retourne son domaine ou null
  async findByUsername(username: string): Promise<User | null> {
    const result = await this.db.query<UserProps>(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (result.rowCount === 0) {
      return null;
    }

    return User.fromDatabase(result.rows[0]);
  }
}
