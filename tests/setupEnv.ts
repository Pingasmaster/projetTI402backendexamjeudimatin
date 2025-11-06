// prépare l'environnement de tests pour exécuter tranquille, évites certain crashes lors de tests sans d'abord copier le .env.example en .env
process.env.PORT = process.env.PORT ?? "4000";
process.env.NODE_ENV = "test";
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST ?? "localhost";
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT ?? "5432";
process.env.POSTGRES_USER = process.env.POSTGRES_USER ?? "stocklink";
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? "stocklink";
process.env.POSTGRES_DB = process.env.POSTGRES_DB ?? "stocklink";
process.env.MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/stocklink-test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS ?? "900000";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? "100";
