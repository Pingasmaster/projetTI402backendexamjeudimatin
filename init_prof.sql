-- script d'init du prof, j'utilise mon propre script un peu différent
-- ============================================
--   Script de création de la base StockLink
-- ============================================

--  Création de la base de données
CREATE DATABASE stocklink;
\c stocklink;

-- ============================================
-- TABLE 1 : WAREHOUSES (entrepôts physiques)
-- ============================================

CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

-- ============================================
-- TABLE 2 : USERS (utilisateurs API)
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 2 : PRODUCTS (articles stockés)
-- ============================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    quantity INT DEFAULT 0,
    warehouse_id INT NOT NULL,
    CONSTRAINT fk_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON DELETE CASCADE
);

-- ============================================
-- TABLE 3 : MOVEMENTS (historique des stocks)
-- ============================================

CREATE TABLE movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);
