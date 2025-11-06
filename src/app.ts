// point d'entrée express pour les middlewares et routes de l'API
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import movementRoutes from "./routes/movementRoutes";
import warehouseRoutes from "./routes/warehouseRoutes";
import {
  warehouseLocationRouter,
  locationLookupRouter,
} from "./routes/locationRoutes";

const app = express();

// middlewares de sécurité HTTP (CSP désactivée hors prod pour simplifier le dev)
app.use(
  helmet({
    contentSecurityPolicy: env.nodeEnv === "production" ? undefined : false,
  }),
);
// autorise le front local à accéder à l'API
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
// parse les payloads JSON et limite la taille pour éviter les abus
app.use(express.json({ limit: "1mb" }));

// Limiteur de débit global pour atténuer les attaques par force brute
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// endpoint simple de monitoring utilisé par les sondes
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// routes métiers regroupées par domaine fonctionnel
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/movements", movementRoutes);
app.use("/warehouses/:id/locations", warehouseLocationRouter);
app.use("/locations", locationLookupRouter);
app.use("/warehouses", warehouseRoutes);

// expose la documentation Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// fournit le fichier OpenAPI brut
app.get("/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});

// sert une version ReDoc pour la doc swagger
app.get("/redoc", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>StockLink Core API – ReDoc</title>
    <link rel="icon" href="data:," />
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      redoc {
        display: block;
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
});

// gestion des routes inconnues et centralisation des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
