# My Shop (ECommerce)

> A single-owner online store — browse products, add to cart, and check out. Two roles: the owner manages everything from a dashboard; customers shop. All powered by Express + SQLite on the backend and React + Bootstrap on the frontend.

If this is your first Express + React project with role-based auth and a shopping cart, you're in the right place. Nothing here is magic. Each file does something small and understandable. Take it one folder at a time.

---

## What You'll Learn

- How **role-based routing** works — one app, two completely different experiences (owner vs customer)
- How to handle **database transactions** — ensuring the cart checkout never partially succeeds
- How to manage **file uploads** with multer — storing product images on disk, not in the database
- How to design a **multi-table database** with foreign keys, cascading deletes, and constraints
- How to handle **edge cases** in e-commerce — stock running out during checkout, duplicate emails, empty cart

---

## Before You Start

- [ ] Node.js v20 or newer? Run `node --version`
- [ ] Have a terminal and a browser?
- [ ] 5 minutes of patience? There are two install steps (backend + frontend).

---

## How Do I Run It?

```bash
# 1. Install all the dependencies (backend and frontend)
npm install
npm install --prefix client

# 2. Start both servers at once
npm run dev
```

That's it. Two things will start:

- **Backend** on [http://localhost:3000](http://localhost:3000)
- **Frontend** on [http://localhost:5173](http://localhost:5173)

The backend creates the SQLite database automatically on first run and seeds it with sample data (categories, products, and two demo accounts).

The database file lives at `database/ecommerce.sqlite`. If you ever want a fresh start, just delete that file and restart the server.

> **Why two install commands?** The root `package.json` has backend dependencies (Express, SQLite, etc.). The `client/` folder is a separate little project with its own `package.json` (React, Vite, Bootstrap). Both need to be installed. You'll get `Cannot find module 'react'` errors if you skip the second one!

### Demo accounts

| Who | Email | Password |
|---|---|---|
| Owner | `owner@shop.com` | `admin123` |
| Customer | `customer@demo.com` | `demo123` |

You can also register a new customer account from the Register page.

### The store uses Philippine pesos (₱)

Prices are listed as plain numbers (e.g., `1499`) which means ₱1,499.00. The frontend formats them with commas.

### Auth is simple

No JWTs, no cookies, no OAuth. After login, the frontend stores your user ID and role in `localStorage` and sends it as a `user-id` header with every request. The backend middleware looks up that header to know who you are. Easy to inspect, easy to debug.

---

## What's in Here?

```
ECommerce/
├── server.js                      # entry point — starts Express on port 3000
├── package.json                   # backend dependencies and dev scripts
├── .env                           # PORT=3000 (change this if needed)
├── .gitignore                     # ignores node_modules, uploads, database
│
├── config/                        # setup files that run once at startup
│   ├── db.js                      #   creates/connects the SQLite database, seeds demo data
│   └── upload.js                  #   configures multer for product image uploads
│
├── middleware/                    # functions that run before controller code
│   └── auth.js                    #   checks user-id header, blocks non-owners from owner routes
│
├── models/                        # each file = one table in the database
│   ├── User.js                    #   find by email, create, update profile, update password
│   ├── Category.js                #   CRUD
│   ├── Product.js                 #   CRUD, search by name/description, filter by category
│   ├── CartItem.js                #   add/update/remove items, calculate cart total
│   ├── Order.js                   #   create order (with transaction), list all/by user
│   └── OrderItem.js               #   get line items for an order
│
├── controllers/                   # "glue" between routes and models — validates input, sends responses
│   ├── userController.js          #   register, login, getMe, updateProfile
│   ├── categoryController.js      #   CRUD for categories (owner-only writes)
│   ├── productController.js       #   CRUD + search + byCategory (owner-only writes)
│   ├── cartController.js          #   add to cart, update qty, remove, checkout (creates order)
│   ├── orderController.js         #   list orders, get detail, update status (owner)
│   └── databaseController.js      #   debug endpoint — dumps all tables (owner only)
│
├── routes/
│   └── routes.js                  #   wires URLs to controllers and middleware (the "map" of the API)
│
├── database/                      # SQLite database auto-created here on first run
├── uploads/                       # product images uploaded through the admin panel
│
└── client/                        # React frontend (Vite + React + Bootstrap)
    ├── package.json               #   frontend dependencies
    ├── vite.config.js             #   Vite config — proxies /api and /uploads to backend
    ├── index.html                 #   the single HTML page React mounts into
    └── src/
        ├── main.jsx               #   React entry point, renders <App />
        ├── App.jsx                #   root component — auth state, 3 layouts, routing
        ├── App.css                #   all global styles (CSS variables, layout, theme)
        ├── api.js                 #   fetch wrapper — attaches user-id header, handles errors
        ├── constants.js           #   STATUS_COLORS map for order status badges
        └── pages/
            ├── Home.jsx           #   public landing — browse products (no login needed)
            ├── Login.jsx          #   login form with demo credentials hint
            ├── Register.jsx       #   registration form (creates customer accounts)
            ├── customers/         #   customer-only pages
            │   ├── Dashboard.jsx  #     browse products, search, add to cart
            │   ├── Cart.jsx       #     cart table, qty controls, checkout form
            │   ├── Orders.jsx     #     order list with detail modals
            │   └── Profile.jsx    #     update name, email, change password
            └── owners/            #   owner-only pages (side nav layout)
                ├── Dashboard.jsx  #     stats (products, orders, customers, revenue)
                ├── Categories.jsx #     CRUD table for categories
                ├── Products.jsx   #     CRUD table with search, filter, image upload
                └── Orders.jsx     #     all orders with inline status dropdown
```

---

## How Does It Work?

### Three layouts, one App

`App.jsx` is the brain. It reads the current user from `localStorage` and picks one of three layouts:

1. **Public layout** (not logged in) — top nav with Shop, Login, Register. See the products, but can't buy.
2. **Customer layout** (logged in, role `customer`) — top nav with Shop, Cart (badge), My Orders, profile, logout. Full shopping flow.
3. **Owner layout** (logged in, role `owner`) — sidebar nav with Dashboard, Categories, Products, Orders. CRUD everything.

### Data flow — step by step

Let's trace what happens when a customer checks out:

```
Customer clicks         api.js            Express          cartController      Order.js model
"Place Order"              │                 │                   │                  │
     │                     │                 │                   │                  │
     │ POST /api/cart/     │                 │                   │                  │
     │   checkout          │                 │                   │                  │
     │────────────────────>│ ───────────────>│                   │                  │
     │                     │                 │ ─────────────────>│                  │
     │                     │                 │                   │ Order.create()   │
     │                     │                 │                   │ ────────────────>│
     │                     │                 │                   │                  │
     │                     │                 │    TRANSACTION: INSERT order →      │
     │                     │                 │    INSERT order_items →             │
     │                     │                 │    UPDATE product stock →           │
     │                     │                 │    DELETE cart items                │
     │                     │                 │                   │ <────────────────│
     │                     │                 │                   │ order + items    │
     │                     │                 │ <─────────────────│                  │
     │ <───────────────────│ <───────────────│  { order }        │                  │
     │ Redirect to Orders  │                 │                   │                  │
```

The checkout wraps everything in a **database transaction** — if any step fails (like stock running out mid-checkout), everything rolls back. The cart stays intact, the stock is untouched. No half-finished orders.

### Image uploads

When the owner creates or edits a product with an image, `multer` saves the file to `uploads/` with a unique name like `product-1717000000000-837492.jpg`. The file path (e.g., `uploads/product-....jpg`) is stored in the `products.image_url` column.

> **Important:** When you update a product with a new image, the old image file stays on disk. Over time, the `uploads/` folder accumulates old images that are no longer used. This is a known limitation of this project — in production, you'd delete old files on update. Just delete the `database/ecommerce.sqlite` file to start fresh if the uploads folder gets too big.

---

## The Database

Six tables, linked by foreign keys. Here's the full schema:

### Table: `users`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| name | TEXT | User's full name |
| email | TEXT | Unique |
| password_hash | TEXT | bcrypt hash — never the actual password |
| role | TEXT | Either `'owner'` or `'customer'` |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Updated on profile changes |

### Table: `categories`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| name | TEXT | Unique |
| description | TEXT | Optional |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Updated on changes |

### Table: `products`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| name | TEXT | Product name |
| description | TEXT | Optional |
| price | REAL | In PHP pesos (e.g., 1499.00) |
| stock | INTEGER | Must be ≥ 0 |
| image_url | TEXT | Path to uploaded image (e.g., `uploads/product-...jpg`) |
| category_id | INTEGER | Links to `categories.id` — SET NULL if category deleted |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Updated on changes |

### Table: `cart_items`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| user_id | INTEGER | Links to `users.id` |
| product_id | INTEGER | Links to `products.id` |
| quantity | INTEGER | Must be > 0 |
| created_at | TEXT | Auto-filled |

Unique on `(user_id, product_id)` — adding the same product again just increases the quantity.

### Table: `orders`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| user_id | INTEGER | Links to `users.id` |
| total | REAL | Order total in PHP pesos |
| status | TEXT | One of: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| shipping_address | TEXT | Where to deliver |
| contact_number | TEXT | Customer's phone |
| created_at | TEXT | Auto-filled |
| updated_at | TEXT | Updated on status change |

### Table: `order_items`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| order_id | INTEGER | Links to `orders.id` |
| product_id | INTEGER | Links to `products.id` |
| quantity | INTEGER | How many of this product |
| price | REAL | Price at time of purchase (snapshot) |
| created_at | TEXT | Auto-filled |

### Relationships (Entity-Relationship)

```
users 1 ──── many cart_items
users 1 ──── many orders
products 1 ──── many cart_items
products 1 ──── many order_items
categories 1 ──── many products
orders 1 ──── many order_items
```

---

## API Endpoints

All endpoints start with `/api`. The `user-id` header is required for any route marked **Auth**. The `requireOwner` middleware is stricter — it checks that the user has the `owner` role.

### Users

| Method | URL | Auth | What it does |
|---|---|---|---|
| `POST` | `/api/users/register` | No | Create a customer account |
| `POST` | `/api/users/login` | No | Login, returns `{ id, name, email, role }` |
| `GET` | `/api/users/me` | getUser | Get current user by `user-id` header |
| `PUT` | `/api/users/profile` | getUser | Update name, email, and optionally password |

### Categories

| Method | URL | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/categories` | No | List all categories |
| `GET` | `/api/categories/:id` | No | Get one category |
| `POST` | `/api/categories` | Owner | Create category `{ name, description? }` |
| `PUT` | `/api/categories/:id` | Owner | Update category |
| `DELETE` | `/api/categories/:id` | Owner | Delete (fails if products reference it) |

### Products

| Method | URL | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/products` | No | List all products (includes `category_name`) |
| `GET` | `/api/products/search?q=term` | No | Search by name or description |
| `GET` | `/api/products/category/:catId` | No | Filter by category ID |
| `GET` | `/api/products/:id` | No | Get one product |
| `POST` | `/api/products` | Owner | Create product (FormData, can include `image` file) |
| `PUT` | `/api/products/:id` | Owner | Update product (FormData, can include new `image`) |
| `DELETE` | `/api/products/:id` | Owner | Delete product and its image file |

### Cart

| Method | URL | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/cart` | getUser | Get cart `{ items, total, count }` |
| `POST` | `/api/cart` | getUser | Add item `{ product_id, quantity? }` |
| `PUT` | `/api/cart/:id` | getUser | Update quantity `{ quantity }` (set to 0 to remove) |
| `DELETE` | `/api/cart/:id` | getUser | Remove item from cart |
| `POST` | `/api/cart/checkout` | getUser | Place order `{ shipping_address, contact_number }` |

### Orders

| Method | URL | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/orders` | Owner | All orders (with customer name/email) |
| `GET` | `/api/orders/my` | getUser | Current user's orders (or all if owner) |
| `GET` | `/api/orders/:id` | getUser | Order detail with line items |
| `PUT` | `/api/orders/:id/status` | Owner | Update status `{ "status": "shipped" }` |

### Debug

| Method | URL | Auth | What it does |
|---|---|---|---|
| `GET` | `/api/database` | Owner | Dump all table rows (passwords redacted) |

---

## Try It With curl

Make sure the backend is running (`npm run dev` or `npm run dev:api`), then paste these into a terminal.

### Register a new customer

```bash
curl http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Learner","email":"jane@example.com","password":"secret123"}'
```

### Login (owner)

```bash
curl http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@shop.com","password":"admin123"}'
```

Save the `id` from the response. Let's say it's `1`. Use it in the `user-id` header below.

### Login (customer)

```bash
curl http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo123"}'
```

If the customer's `id` is `2`, use `user-id: 2` for cart and order commands.

### Browse products

```bash
curl http://localhost:3000/api/products
```

### Search products

```bash
curl "http://localhost:3000/api/products/search?q=cotton"
```

### Add to cart (customer only)

```bash
curl http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "user-id: 2" \
  -d '{"product_id":1,"quantity":2}'
```

### View cart

```bash
curl http://localhost:3000/api/cart -H "user-id: 2"
```

### Checkout

```bash
curl http://localhost:3000/api/cart/checkout \
  -H "Content-Type: application/json" \
  -H "user-id: 2" \
  -d '{"shipping_address":"456 Oak St, Manila","contact_number":"+63 912 345 6789"}'
```

### See your orders

```bash
curl http://localhost:3000/api/orders/my -H "user-id: 2"
```

### Owner: see all orders

```bash
curl http://localhost:3000/api/orders -H "user-id: 1"
```

### Owner: update order status

```bash
curl http://localhost:3000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "user-id: 1" \
  -d '{"status":"shipped"}'
```

Valid statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.

### Debug: dump database (owner only)

```bash
curl http://localhost:3000/api/database -H "user-id: 1"
```

---

## Tech Stack

| Package | What It Does | Why We Use It |
|---------|-------------|---------------|
| express | HTTP server | Simple, widely used, great for learning |
| better-sqlite3 | Talks to SQLite | Synchronous — no async/await needed |
| bcryptjs | Password hashing | Pure JavaScript, no native deps |
| multer | File upload handling | Saves product images to disk |
| cors | Cross-origin requests | So the browser frontend can talk to the API |
| react | UI library | Builds the store interface |
| react-router-dom | Client-side routing | Different pages for owner vs customer |
| bootstrap | CSS framework | Clean UI components (CSS only, no JS) |
| vite | Frontend dev server + build | Fast, proxies `/api` and `/uploads` to backend |
| nodemon | Auto-restarts server on save | Dev convenience |
| concurrently | Runs backend + frontend together | One terminal, two servers |

---

## Customization Guide

### Add a new product field (e.g., "brand")

1. **Add the column** — delete `database/ecommerce.sqlite`, then in `config/db.js`, add `brand TEXT NULL` to the products CREATE TABLE statement
2. **Update the Product model** — add `brand` to INSERT and UPDATE queries in `models/Product.js`
3. **Update the controller** — accept `brand` in `controllers/productController.js`
4. **Update the frontend form** — add a brand input in `client/src/pages/owners/Products.jsx`
5. **Test it** — restart the server, create a new product with a brand

### Change the store name

1. **Open `client/src/App.jsx`** and find the sidebar header text (search for `<h5>`)
2. Change `"My Shop"` to your store name
3. Also update the `<title>` in `client/index.html`

---

## Challenge Yourself

- 🟢 **Easy:** Add a "search by category" dropdown on the customer dashboard.
- 🟢 **Easy:** Change the order status colors in `client/src/constants.js`.
- 🟡 **Medium:** Add a **product review** system — a new `reviews` table, a new endpoint, and a star rating component on the product page.
- 🟡 **Medium:** Add a **stock notification** — when stock is below 5, show a warning on the owner dashboard.
- 🔴 **Hard:** Implement a **discount/coupon** system — a `coupons` table, apply discount during checkout, validate coupon codes.

---

## Troubleshooting

| Error | What It Means | What To Try |
|-------|--------------|-------------|
| `EADDRINUSE` on port 3000 or 5173 | Port already taken | Try `npx kill-port 3000 5173` or change ports in `.env` and `client/vite.config.js` |
| `Cannot find module 'react'` | Frontend deps not installed | Run `npm install --prefix client` — don't skip the second install step! |
| `Cannot find module 'better-sqlite3'` | Backend deps not installed | Run `npm install` in the project root |
| Database errors | SQLite file corrupted | Delete `database/ecommerce.sqlite` and restart — the server will recreate and seed it |
| Blank page in browser | Frontend or proxy issue | Make sure both servers are running. Check both terminals for errors. |
| "Login to Buy" loses product context | After logging in, you're redirected to dashboard, not the product you were viewing | This is a known limitation. The app doesn't remember which product you were looking at before login. Try adding a redirect parameter to the login URL. |
| Cart checkout stock race condition | Two customers buying the same last item | Checkout uses a database transaction — if stock hits 0 during one transaction, the other gets a "product out of stock" error and the cart stays intact. |
| Old product images accumulate in `uploads/` | Updating a product image creates a new file but leaves the old one | This is expected. Delete `database/ecommerce.sqlite` for a fresh start, or manually clean the `uploads/` folder. |
| curl commands not working | Backend not running | Open a second terminal. Run `npm run dev`. Try curl again. |
| `.env` changes not taking effect | Using `npm start` instead of `npm run dev` | Use `npm run dev` — nodemon reads `.env` automatically |

---

## What Should I Do Next?

1. **Read `config/db.js`** — see the full database schema and seed data in one file.
2. **Read `App.jsx`** — understand the three-layout system. This pattern is used in many real apps.
3. **Trace a checkout** from `Cart.jsx` → `api.js` → `cartController.js` → `Order.js` model. See how the transaction protects against data corruption.
4. **Ready for more?** Try **OnlineVoting** — it has 7 database tables, an audit log, and CSV import features.

---

## Production-ish Notes (optional)

- For deployment, run `cd client && npm run build` and serve `client/dist` as static files from Express.
- The `uploads/` folder grows over time. In production, you'd add a cleanup job to delete orphaned files.
- Auth is simple (header-based). For a production app, you'd use JWTs or session cookies instead.
- Stock race conditions are handled by the database transaction, but at scale you'd need row-level locking.

---

*"Your first time running this and it crashes? That's normal. Read the error. Google the first line. Ask someone. Every programmer you look up to started exactly where you are now — staring at a terminal, confused, one Google search away from figuring it out."*

Happy coding!
