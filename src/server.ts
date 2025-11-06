// lance le serveur HTTP qui sert le projet
import app from "./app";
import { env } from "./config/env";
import { postgresPool } from "./config/postgres";
import { mongoClient, resetMongoConnectionState } from "./config/mongo";

// fonction principale qui initialise les connexions et démarre l'écoute HTTP
const start = async () => {
  try {
    // Vérifie que PostgreSQL est joignable avant de lancer l'API.
    const postgresClient = await postgresPool.connect();
    postgresClient.release();
    // Établit la connexion à MongoDB pour les dépôts utilisant le document store.
    await mongoClient.connect();

    app.listen(env.port, () => {
      console.log(`StockLink Core API prêt sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Impossible de démarrer le serveur", error);
    process.exit(1);
  }
};

// arrêt gracieux lors d'un CTRL+C
process.on("SIGINT", async () => {
  await postgresPool.end();
  await mongoClient.close();
  resetMongoConnectionState();
  process.exit(0);
});

start();
