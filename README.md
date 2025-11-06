# StockLink Core API

Plateforme API pour la gestion des entrepôts StockLink Core. Ce projet adopte une architecture MVC avec TypeScript, expose une documentation OpenAPI/Swagger, et se connecte à PostgreSQL (données opérationnelles) ainsi qu'à MongoDB (cartographie interne).

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)
- [Documentation API](#documentation-api)
- [Endpoints principaux](#endpoints-principaux)

## Prérequis

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- MongoDB 6+

## Installation

```bash
npm install
```

## Configuration

1. Dupliquez `.env.example` en `.env` puis adaptez les valeurs (ports, identifiants BD, secret JWT, etc.).
2. Assurez-vous que les bases PostgreSQL et MongoDB sont accessibles avec ces paramètres.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre l'API en mode développement (ts-node). |
| `npm run build` | Compile le projet TypeScript dans `dist/`. |
| `npm start` | Lance la version compilée (`dist/server.js`). |
| `npm run openapi:build` | Génère `openapi.json` à partir de la configuration Swagger. |

## Structure du projet

```
stocklink-core/
├── db/
│   └── migrations/        # Scripts SQL (PostgreSQL)
├── scripts/
│   └── generate-openapi.ts
├── src/
│   ├── app.ts             # Configuration Express + middlewares
│   ├── server.ts          # Point d’entrée serveur
│   ├── config/            # Connexions PG & Mongo, variables d'environnement
│   ├── controllers/       # Logique HTTP
│   ├── middlewares/       # Auth, validation, erreurs...
│   ├── models/            # Types TypeScript
│   ├── routes/            # Déclarations des routes
│   ├── schemas/           # Schémas Zod (validation)
│   ├── services/          # Accès aux données / logique métier
│   ├── utils/             # Helpers (JWT, async handler)
│   └── swagger.ts         # Définition OpenAPI
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Base de données

- **PostgreSQL** : tables `warehouses`, `products`, `movements` (scripts SQL dans `db/migrations/001_init.sql`).
- **MongoDB** : collection `locations` décrivant la disposition interne des entrepôts.

Exécutez les migrations SQL via votre outil habituel (psql, migrateur, etc.). La collection MongoDB est créée dynamiquement.

## Sécurité

- Authentification JWT (route `POST /auth/login`) via identifiants définis dans `.env`.
- Middleware `authenticate` protège toutes les routes métier.
- `helmet`, `cors`, `express-rate-limit` pour renforcer la sécurité HTTP.
- Validation des entrées avec Zod et gestion centralisée des erreurs.

## Documentation API

- Swagger UI : http://localhost:`PORT`/docs
- ReDoc (lecture seule) : http://localhost:`PORT`/redoc
- Spec JSON : http://localhost:`PORT`/openapi.json

Générez/rafraîchissez la spec avec :

```bash
npm run openapi:build
```

## Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Obtenir un token JWT. |
| GET | `/products` | Liste des produits (JWT requis). |
| POST | `/products` | Créer un produit. |
| PUT | `/products/:id` | Mettre à jour un produit. |
| DELETE | `/products/:id` | Supprimer un produit. |
| GET | `/warehouses/:id/locations` | Récupérer la cartographie d’un entrepôt. |
| POST | `/warehouses/:id/locations` | Créer la cartographie d’un entrepôt. |
| PUT | `/warehouses/:id/locations` | Mettre à jour la cartographie. |
| GET | `/locations/:binCode/exists` | Vérifier l’existence d’un bac. |
| GET | `/movements` | Historique des mouvements de stock. |
| POST | `/movements` | Enregistrer un mouvement (met à jour le stock). |

Toutes ces routes (hors `/auth/login` & `/healthz`) nécessitent un token Bearer valide.
