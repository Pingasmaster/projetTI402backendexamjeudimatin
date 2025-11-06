// branche MongoDB
import { MongoClient } from "mongodb";
import { env } from "./env";

const client = new MongoClient(env.mongoUri);
// Empêche les reconnections multiples lorsque l'instance est réutilisée.
let isConnected = false;

export const mongoClient = client;

// initialise la connexion au premier appel
export const getMongoDb = async () => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db();
};

// aide pour les tests qui nécessitent un nouvel état de connexion
export const resetMongoConnectionState = () => {
  isConnected = false;
};
