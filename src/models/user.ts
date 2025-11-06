// modèle utilisateurs

// les differents rôles dispos pour un utilisateur
export type UserRole = "user" | "admin";

// structure utilisateur
export interface UserProps {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

// données minimales pour créer un utilisateur (hors mot de passe)
export interface UserCreateProps {
  username: string;
  role?: UserRole;
}

// données fournies lors de l'inscription utilisateur
export interface UserRegistrationInput extends UserCreateProps {
  password: string;
}

// domaine métier d'un utilisateur authentifié
export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly password: string,
    public readonly role: UserRole,
  ) {}

  static fromDatabase(props: UserProps): User {
    return new User(props.id, props.username, props.password, props.role);
  }

  // donne une vue plus localisée de l'utilisateur
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
    };
  }
}
