// Ce fichier capture l'identité et le rôle des utilisateurs.
export type UserRole = "user" | "admin";

export interface UserProps {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateProps {
  username: string;
  role?: UserRole;
}

export interface UserRegistrationInput extends UserCreateProps {
  password: string;
}

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

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
    };
  }
}
