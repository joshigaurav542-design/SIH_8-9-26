# Smart Artisan Companion - Database Layer (Docker + Prisma)

This directory contains the database infrastructure for the **Smart Artisan Companion** (SIH 2026 Problem Statement `SIH26090`).

It uses **PostgreSQL in Docker** for containerized database services and **Prisma ORM** for schema definition, migrations, seeding, and visual administration via **Prisma Studio**.

---

## 📁 Directory Structure

```
data/
├── docker-compose.yml       # PostgreSQL 16 & Prisma Studio containers
├── Dockerfile               # Container setup for Prisma CLI & Studio
├── package.json             # NPM scripts for Prisma workflows
├── seed.js                  # Automated initial database seeder
├── .env                     # Database connection credentials
├── .env.example             # Template credentials
└── prisma/
    └── schema.prisma        # Prisma data models (Artisan, Product, Certificate, Order)
```

---

## 🚀 Quick Start with Docker (1-Command Launch)

From this `data` folder:

```bash
docker compose up -d
```

This will automatically:
1. Start a **PostgreSQL 16** container on port `5432`.
2. Push the Prisma schema into PostgreSQL.
3. Run `seed.js` to populate PM Vishwakarma Master Artisans & GI-certified craft products.
4. Launch **Prisma Studio** Web GUI on **http://localhost:5555**.

To stop the containers:
```bash
docker compose down
```

---

## 🛠️ Local Development (Using Node.js on Host)

If you prefer to run Prisma commands directly from your local terminal:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL Container
```bash
docker compose up -d postgres
```

### 3. Push Schema & Seed
```bash
npx prisma db push
node seed.js
```

### 4. Launch Prisma Studio Web GUI
```bash
npx prisma studio --port 5555
```
Open **[http://localhost:5555](http://localhost:5555)** in your browser to view and edit tables visually.

---

## 📊 Database Models

* **`Artisan`**: PM Vishwakarma ID, skills, wages, and craft guild information.
* **`Product`**: Craft catalogue, optical symmetry score, weave density, GI badges, and ONDC status.
* **`AuthenticityCertificate`**: Cryptographic verification hash, GI registry tag, and museum grade.
* **`Order` & `OrderItem`**: E-commerce / WhatsApp / ONDC direct consumer orders and payments.
* **`OfflineSyncLog`**: Queued synchronization batches for zero-internet rural artisan hubs.
