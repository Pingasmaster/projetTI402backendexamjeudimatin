// prépare la connexion PostgreSQL
import { Pool } from "pg";
import { env } from "./env";

export const postgresPool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  user: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,
  max: 10,
});

// détecte les incidents du pool
postgresPool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error", error);
});
