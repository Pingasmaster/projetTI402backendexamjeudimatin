# StockLink Pro API

API professionnelle sécurisée pour la gestion des stocks multi-entrepôts. Elle expose une documentation Swagger, applique une validation stricte des entrées et protège toutes les opérations sensibles par JWT et contrôle de rôle.

## Mise en route

1. Copier la configuration : `cp .env.example .env` puis adapter les valeurs (PostgreSQL, MongoDB, `JWT_SECRET`).
2. Installer les dépendances : `npm install`.
3. Initialiser la base PostgreSQL : `psql -U <user> -f init_db.sql`.
4. Lancer l'API en développement : `npm run dev` (ou `npm start` après `npm run build`).

## Configuration JWT

- La clé secrète est définie via la variable `JWT_SECRET` dans `.env`.
- Pour générer une clé 256 bits : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- Tout jeton inclut l'`id`, le `username` et le `role` de l'utilisateur.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre l'API en mode développement (ts-node). |
| `npm run build` | Compile TypeScript vers `dist/`. |
| `npm start` | Lance la version compilée (`node dist/src/server.js`). |
| `npm run doc` | Génère `openapi.json` depuis `src/swagger.ts`. |
| `npm test` | Lance la suite Jest (unitaires + intégration). |

## Tests

- Exécution : `npm test`
- La suite couvre :
  - la logique métier de mise à jour de stock (services),
  - la validation et la gestion d'erreur sur les routes clés,
  - un test d'intégration `/auth/login`.

## Sécurité intégrée

- `helmet` pour durcir les en-têtes HTTP.
- `cors` limité à `http://localhost:3000`.
- Rate limiting : 100 requêtes / 15 minutes par adresse IP.
- Validation des payloads avec Zod sur `auth`, `products`, `movements`, `warehouses` et `locations`.
- Mots de passe hachés avec bcrypt et gestion des rôles (`user` / `admin`).

## Documentation API

- Swagger UI : `http://localhost:${PORT}/docs`
- Spécification JSON : `http://localhost:${PORT}/openapi.json`
- ReDoc : `http://localhost:${PORT}/redoc`

## Routes et niveau de protection

| Méthode | Endpoint | Accès |
|---------|----------|-------|
| POST | `/auth/register` | Libre |
| POST | `/auth/login` | Libre |
| GET | `/health` | Libre |
| GET | `/products` | Libre |
| POST | `/products` | Authentifié |
| PUT | `/products/:id` | Authentifié |
| DELETE | `/products/:id` | Admin |
| GET | `/movements` | Libre |
| POST | `/movements` | Authentifié |
| GET | `/warehouses` | Libre |
| POST | `/warehouses` | Authentifié |
| PUT | `/warehouses/:id` | Authentifié |
| DELETE | `/warehouses/:id` | Admin |
| GET | `/warehouses/:id/locations` | Libre |
| POST | `/warehouses/:id/locations` | Authentifié |
| PUT | `/warehouses/:id/locations` | Authentifié |
| GET | `/locations/:binCode/exists` | Libre |

## Structure du projet

```
stocklink-core/
├── init_db.sql            # Script de création (inclut la table users)
├── src/
│   ├── app.ts             # Configuration Express + middlewares
│   ├── server.ts          # Point d’entrée
│   ├── config/            # Connexions PG & Mongo, variables d'environnement
│   ├── controllers/       # Logique HTTP
│   ├── middlewares/       # Auth, validation, rôles, erreurs
│   ├── models/            # Types (produits, mouvements, users…)
│   ├── routes/            # Déclarations des endpoints
│   ├── schemas/           # Schémas Zod
│   ├── services/          # Accès données / règles métier
│   ├── utils/             # Helpers (JWT, async handler)
│   └── swagger.ts         # Définition OpenAPI
├── tests/                 # Tests unitaires et d’intégration
├── .env.example
└── README.md
```

## Bases de données

- **PostgreSQL** : tables `users`, `warehouses`, `products`, `movements`.
- **MongoDB** : collection `locations` pour la cartographie interne.

Bon déploiement !
