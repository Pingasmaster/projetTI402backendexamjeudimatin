# Projet backend stocklink api

Ce projet adopte une architecture MVC avec typescript comme demandé, expose une documentation OpenAPI/Swagger comme vu en cours, et se connecte à PostgreSQL (données opérationnelles) ainsi qu'à MongoDB (cartographie interne).

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)
- [Documentation API](#documentation-api)
- [Endpoints principaux](#endpoints-principaux)

## Prérequis

- Node.js, npm, PostgreSQL, MongoDB installés
- Les serveurs PostgreSQL et MongoDB sont lancés en arrière plan
- Copiez .env.example à .env, faites en sorte que l'utilisateur et le mot de passe Postgresql soit bon. Créer l'utilisateur stocklink si besoin.

## Installation

```bash
npm install
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run build` | Compile le projet TypeScript dans `dist/` (les sources se retrouvent sous `dist/src`). |
| `npm run test` | Voir la section Tests |
| `npm run dev` | Démarre l'API en mode développement via `ts-node`. |
| `npm start` | Lance la version compilée (`node dist/src/server.js`). |
| `npm run openapi:build` | Génère `openapi.json` à partir de la configuration Swagger (nécessite `npm run build` si vous lancez la version compilée). |

## Tests

- `npm test` lance la suite Jest (ma suite de tests favorite!).

Pour repartir d’un environnement propre et vérifier le projet de bout en bout :

```bash
rm -rf dist/ node_modules/ && npm install && npm run build && npm run test && npm run openapi:build && npm run start
```

Ensuite on peut naviguer vers http://localhost:`PORT`/docs pour voir la documentation swagger et tester l'api manuellement.

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
├── reponses_sauvegarde.txt # Fichier réponse demandé
├── tsconfig.json
└── README.md
```

## Base de données

- **PostgreSQL** : tables `warehouses`, `products`, `movements` (scripts SQL dans `db/migrations/001_init.sql`).
- **MongoDB** : collection `locations` décrivant la disposition interne des entrepôts.

Exécutez les migrations SQL via votre outil habituel. La collection MongoDB est créée dynamiquement.

## Sécurité

- Authentification JWT (route `POST /auth/login`) via identifiants définis dans `.env`.
- Middleware `authenticate` protège toutes les routes métier.
- `helmet`, `cors`, `express-rate-limit` pour renforcer la sécurité HTTPS (devrait être en prod, ici est http car pas de certificat web évidemment car pas de domaine).
- Validation des entrées avec Zod et gestion centralisée des erreurs (touche personelle que j'aime bien)

## Documentation API

- Swagger UI : http://localhost:`PORT`/docs
- ReDoc (lecture seule) : http://localhost:`PORT`/redoc
- Spec JSON : http://localhost:`PORT`/openapi.json

Générez la doc avec :

```bash
npm run openapi:build
```

## Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Obtenir un token JWT. |
| GET | `/warehouses` | Lister les entrepôts (JWT requis). |
| GET | `/warehouses/:id` | Consulter un entrepôt donné. |
| POST | `/warehouses` | Créer un entrepôt. |
| PUT | `/warehouses/:id` | Mettre à jour un entrepôt. |
| DELETE | `/warehouses/:id` | Supprimer un entrepôt. |
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

Toutes ces routes (hors `/auth/login` & `/health`) nécessitent un token Bearer valide.
