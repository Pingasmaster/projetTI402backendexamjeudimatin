// Ce fichier branche MongoDB pour la cartographie sans friction.
import { MongoClient } from "mongodb";
import { env } from "./env";

const client = new MongoClient(env.mongoUri);
let isConnected = false;

export const mongoClient = client;

export const getMongoDb = async () => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db();
};

export const resetMongoConnectionState = () => {
  isConnected = false;
};
