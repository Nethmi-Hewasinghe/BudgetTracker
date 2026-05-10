# BudgetTrack (Personal Finance & Budget Tracking)

Full-stack MERN app (React + Vite, Node/Express, MongoDB) with JWT auth, transactions, categories, budgets, and a dashboard with charts.

## Monorepo structure

```text
backend/   Express + MongoDB REST API (MVC)
frontend/  React + Vite SPA (Router, Axios, Recharts)
```

## Setup instructions (local)

### Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or Atlas)

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API runs on `http://localhost:5000` and exposes routes under `/api/*`.

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

See `backend/.env.example`.

## API routes (summary)

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protected)
- **Categories** (protected)
  - `GET /api/categories?type=Income|Expense`
  - `POST /api/categories`
  - `PUT /api/categories/:id`
  - `DELETE /api/categories/:id`
- **Transactions** (protected)
  - `GET /api/transactions?type=&category=&startDate=&endDate=`
  - `POST /api/transactions`
  - `PUT /api/transactions/:id`
  - `DELETE /api/transactions/:id`
- **Budgets** (protected)
  - `GET /api/budgets?month=&year=`
  - `POST /api/budgets`
  - `PUT /api/budgets/:id`
  - `DELETE /api/budgets/:id`
- **Dashboard** (protected)
  - `GET /api/dashboard?month=&year=`

## ER diagram (description)

- **User** 1—N **Transaction**
- **User** 1—N **Category**
- **User** 1—N **Budget**
- **Category** 1—N **Transaction**
- **Category** 1—N **Budget**

Each record is scoped to a `user` (multi-tenant by user id).

## Sample dashboard UI (what you’ll see)

- **Summary cards**: Total income, total expenses, current balance
- **Charts (Recharts)**:
  - Expense distribution by category (Pie)
  - Monthly income vs expenses (Bar)
  - Budget vs actual spending (Line)
- **Table**: Recent transactions

