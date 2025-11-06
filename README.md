# Projet backend stocklink api

Ce projet adopte une architecture MVC en TypeScript, expose une documentation OpenAPI/Swagger, et s’interface avec PostgreSQL (données opérationnelles) ainsi que MongoDB (cartographie interne). Toute la couche métier est couverte par des tests Jest et la documentation API est générée automatiquement.

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

- Node.js, npm, PostgreSQL et MongoDB installés.
- Les services PostgreSQL et MongoDB sont démarrés localement.
- Copier `.env.example` vers `.env`, ajuster les identifiants Postgres (`stocklink` par défaut) et la variable `JWT_SECRET`. Créer l’utilisateur Postgres si nécessaire, puis appliquer le script `init_db.sql`.

## Installation

```bash
npm install
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run build` | Compile le projet TypeScript dans `dist/` (sources générées sous `dist/src`). |
| `npm test` | Lance la suite Jest configurée dans `jest-conf.ts`. |
| `npm run dev` | Démarre l’API en mode développement via `ts-node`. |
| `npm start` | Lance la version compilée (`node dist/src/server.js`). |
| `npm run doc` | Génère `openapi.json` à partir de la définition Swagger (peut être lancé à chaud). |

## Tests

- `npm test` exécute 9 suites Jest (unitaires et routes) validant services, contrôleurs Express, middleware et intégration minimale avec un total de 68 tests.

Pour revalider l’ensemble du projet sur un environnement propre :

```bash
rm -rf dist/ node_modules/ && npm install && npm run build && npm test && npm run doc && npm start
```

Ensuite, rendez-vous sur http://localhost:`PORT`/docs pour parcourir la documentation Swagger et tester les endpoints.

## Structure du projet

```
stocklink-pro/
├── dist/                  # Sortie de compilation TypeScript
├── init_db.sql            # Script SQL principal (PostgreSQL)
├── init_prof.sql          # Variante de script fournie pour référence
├── openapi.json           # Spécification OpenAPI générée
├── jest-conf.ts           # Configuration Jest (SWC)
├── package.json
├── tsconfig.json
├── reponses_sauvegarde.txt
├── src/
│   ├── app.ts             # Configuration Express + middlewares
│   ├── server.ts          # Point d’entrée serveur
│   ├── config/            # Connexions PostgreSQL & MongoDB, env
│   ├── controllers/       # Logique HTTP par domaine
│   ├── middlewares/       # Auth, validation, erreurs, rôles
│   ├── models/            # Modèles métier (Warehouse, Product…)
│   ├── routes/            # Déclarations des routes Express
│   ├── schemas/           # Schémas Zod pour la validation
│   ├── services/          # Couche métier + accès aux données
│   ├── utils/             # Helpers JWT, async handler, etc.
│   └── swagger.ts         # Définition OpenAPI centrale
└── tests/                 # Tests Jest (services + routes)
```

## Base de données

- **PostgreSQL** : tables `warehouses`, `products`, `movements`, `users` (voir `init_db.sql` ou la variante `init_prof.sql` pour l’initialisation).
- **MongoDB** : collection `locations` décrivant la cartographie interne des entrepôts ; création à la volée lors des insertions.

## Sécurité

- Authentification JWT (`POST /auth/login`) avec jetons signés à partir de `JWT_SECRET`.
- Middleware `authenticate` pour protéger les opérations critiques, complété par `isAdmin` pour les actions sensibles (ex : suppression).
- `helmet`, `cors` (limité à `http://localhost:3000`) et `express-rate-limit` pour durcir l’API.
- Données validées avec Zod sur l’ensemble des domaines (`auth`, `products`, `warehouses`, `movements`, `locations`).

## Documentation API

- Swagger UI : http://localhost:`PORT`/docs
- ReDoc (lecture seule) : http://localhost:`PORT`/redoc
- Spécification JSON : http://localhost:`PORT`/openapi.json

Générez ou mettez à jour la documentation avec :

```bash
npm run doc
```

## Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscrire un utilisateur (hash du mot de passe, rôle optionnel). |
| POST | `/auth/login` | Obtenir un token JWT. |
| GET | `/health` | Contrôle de disponibilité. |
| GET | `/warehouses` | Lister les entrepôts. |
| GET | `/warehouses/:id` | Consulter un entrepôt donné. |
| POST | `/warehouses` | Créer un entrepôt (JWT requis). |
| PUT | `/warehouses/:id` | Mettre à jour un entrepôt (JWT requis). |
| DELETE | `/warehouses/:id` | Supprimer un entrepôt (rôle admin). |
| GET | `/products` | Lister les produits. |
| POST | `/products` | Créer un produit (JWT requis). |
| PUT | `/products/:id` | Mettre à jour un produit (JWT requis). |
| DELETE | `/products/:id` | Supprimer un produit (rôle admin). |
| GET | `/warehouses/:id/locations` | Récupérer la cartographie d’un entrepôt. |
| POST | `/warehouses/:id/locations` | Créer la cartographie (JWT requis). |
| PUT | `/warehouses/:id/locations` | Mettre à jour la cartographie (JWT requis). |
| GET | `/locations/:binCode/exists` | Vérifier l’existence d’un bac. |
| GET | `/movements` | Historique des mouvements de stock. |
| POST | `/movements` | Enregistrer un mouvement (JWT requis, met à jour les quantités). |

Routes publiques : `/auth/*`, `/health`, `/warehouses` (GET), `/products` (GET), `/warehouses/:id/locations` (GET), `/locations/:binCode/exists`, `/movements` (GET). Toutes les autres nécessitent un token Bearer valide.
