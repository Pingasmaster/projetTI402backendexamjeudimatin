import app from "./app";
import { env } from "./config/env";
import { postgresPool } from "./config/postgres";
import { mongoClient, resetMongoConnectionState } from "./config/mongo";

const start = async () => {
  try {
    const postgresClient = await postgresPool.connect();
    postgresClient.release();
    await mongoClient.connect();

    app.listen(env.port, () => {
      console.log(`StockLink Core API prêt sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Impossible de démarrer le serveur", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await postgresPool.end();
  await mongoClient.close();
  resetMongoConnectionState();
  process.exit(0);
});

start();
