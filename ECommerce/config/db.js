const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'ecommerce.sqlite');

// Make sure the database directory exists (will be created on first run)
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK (role IN ('owner', 'customer')) DEFAULT 'customer',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NULL
  );

  CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NULL,
    price       REAL    NOT NULL CHECK (price >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url   TEXT    NULL,
    category_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NULL
  );

  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

  CREATE TABLE IF NOT EXISTS cart_items (
    id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
  );

  CREATE INDEX IF NOT EXISTS idx_cartitems_user ON cart_items(user_id);

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total            REAL    NOT NULL CHECK (total >= 0),
    status           TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT    NOT NULL,
    contact_number   TEXT    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NULL
  );

  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    price      REAL    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orderitems_order ON order_items(order_id);
`);

const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (userCount === 0) {
  const ownerHash = bcrypt.hashSync('admin123', 10);
  const customerHash = bcrypt.hashSync('demo123', 10);

  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
  insertUser.run('Store Owner', 'owner@shop.com', ownerHash, 'owner');
  insertUser.run('Demo Customer', 'customer@demo.com', customerHash, 'customer');

  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  insertCategory.run('Electronics', 'Gadgets and devices');
  insertCategory.run('Clothing', 'Apparel and accessories');
  insertCategory.run('Home & Living', 'Furniture and home decor');
  insertCategory.run('Books', 'Reading materials');

  const insertProduct = db.prepare('INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)');
  insertProduct.run('Wireless Headphones', 'Bluetooth 5.0 noise-cancelling headphones', 1499.00, 25, 1);
  insertProduct.run('USB-C Charger', 'Fast charging 65W GaN charger', 899.00, 50, 1);
  insertProduct.run('Cotton T-Shirt', 'Premium cotton crew neck t-shirt', 399.00, 100, 2);
  insertProduct.run('Denim Jacket', 'Classic blue denim jacket', 1799.00, 15, 2);
  insertProduct.run('Ceramic Mug Set', 'Set of 4 handcrafted ceramic mugs', 599.00, 30, 3);
  insertProduct.run('LED Desk Lamp', 'Adjustable brightness LED desk lamp', 749.00, 20, 3);
  insertProduct.run('JavaScript for Beginners', 'Learn JavaScript from scratch', 499.00, 40, 4);
  insertProduct.run('Data Structures in C', 'Comprehensive guide to DSA in C', 649.00, 35, 4);
}

module.exports = db;
