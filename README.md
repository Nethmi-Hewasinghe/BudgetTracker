# FinTrack — Personal Finance & Budget Tracking Application

**FinTrack** is a full-stack MERN application that helps users manage their personal finances by tracking income, expenses, categories, monthly budgets, and financial insights through a clean and structured dashboard.

The application includes secure authentication, Google Sign-In, transaction filtering, budget progress tracking, and interactive charts for better financial understanding.

---

## Tech Stack

### Frontend
- React + Vite
- React Router DOM
- Axios
- Recharts
- Lucide React Icons
- Modern responsive CSS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google Sign-In token verification
- bcrypt password hashing
- MVC-based structure

---

## Key Features

### Authentication
- User registration
- User login
- Google Sign-In
- JWT-based protected routes
- Logout functionality
- Password hashing with bcrypt

### Income & Expense Management
- Add transactions
- Edit transactions
- Delete transactions
- View all transactions
- Filter transactions by:
  - Transaction type
  - Category
  - Date range

Each transaction includes:
- Title
- Amount
- Category
- Type: Income / Expense
- Date
- Optional note

### Category Management
- Add categories
- Edit categories
- Delete categories
- Separate Income and Expense categories

### Budget Management
- Create monthly budgets by category
- Update budgets
- Delete budgets
- View budget usage
- Display actual spending compared with planned budget
- Visual alert when spending exceeds the assigned budget

### Dashboard
The dashboard provides:

#### Financial Summary
- Total Income
- Total Expenses
- Current Balance
- Budget Usage

#### Visual Insights
- Expense distribution by category
- Monthly income vs expenses
- Budget vs actual spending
- Recent transaction list

### Currency Display
- Financial values are displayed in **Sri Lankan Rupees**
- Example: `LKR 25,000.00`

---

## Project Structure

```text
FinTrack/
│
├── backend/                 Express + MongoDB REST API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                React + Vite SPA
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

## Local Setup Instructions

### Prerequisites

Before running the project, install:

- Node.js — LTS version recommended
- npm
- MongoDB Atlas account or local MongoDB database
- Google Cloud OAuth Client ID for Google Sign-In

---

## 1. Backend Setup

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a `.env` file by copying `.env.example`.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Then update the environment values inside `backend/.env`.

Start the backend server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5001
```

API base path:

```text
http://localhost:5001/api
```

---

## 2. Frontend Setup

Open another terminal and run:

```bash
cd frontend
npm install
```

Create a `.env` file by copying `.env.example`.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

## Environment Variables

### `backend/.env.example`

```env
NODE_ENV=development
PORT=5001

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174

GOOGLE_CLIENT_ID=your_google_web_client_id
```

### `frontend/.env.example`

```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

> Real `.env` files are not included in the repository for security reasons.

---

## Google Sign-In Setup

To enable Google authentication:

1. Go to **Google Cloud Console**
2. Create or select a project
3. Configure the OAuth consent screen
4. Create an OAuth Client ID for a **Web Application**
5. Add the following authorized JavaScript origin:

```text
http://localhost:5173
```

6. Copy the generated Google Client ID into:

```env
backend/.env
GOOGLE_CLIENT_ID=your_google_web_client_id
```

```env
frontend/.env
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

7. Restart both frontend and backend servers after updating environment variables.

---

## API Routes Summary

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/google` | Login or register with Google Sign-In |
| GET | `/api/auth/me` | Get current logged-in user |

---

### Categories — Protected

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories?type=Income\|Expense` | Get user categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

---

### Transactions — Protected

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions?type=&category=&startDate=&endDate=` | Get filtered transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

---

### Budgets — Protected

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets?month=&year=` | Get budgets for a selected month/year |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

---

### Dashboard — Protected

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard?month=&year=` | Get dashboard summary and chart data |

---

## Budget vs Actual Spending Logic

The application compares:

- **Budget amount**: planned monthly spending for a selected category
- **Actual spending**: total expense transactions recorded for that same category and month

Example:

| Category | Budget | Actual Spending |
|---|---:|---:|
| Food | LKR 20,000 | LKR 16,000 |
| Transport | LKR 10,000 | LKR 12,500 |
| Entertainment | LKR 15,000 | LKR 8,000 |

This helps users identify whether they are:

- Under budget
- Near the budget limit
- Over budget

---

## Authentication Flow

### Email / Password Login

```text
User submits login form
        ↓
Backend validates credentials
        ↓
JWT token is generated
        ↓
Frontend stores the token
        ↓
Protected API requests include the token
```

### Google Sign-In

```text
User clicks Google Sign-In
        ↓
Google returns an ID credential
        ↓
Frontend sends it to backend
        ↓
Backend verifies Google token
        ↓
User is created or logged in
        ↓
Backend returns application JWT
```

---

## ER Diagram Description

### Relationships

- **User** 1 — N **Transaction**
- **User** 1 — N **Category**
- **User** 1 — N **Budget**
- **Category** 1 — N **Transaction**
- **Category** 1 — N **Budget**

Each user’s transactions, categories, and budgets are stored separately using the corresponding `userId`.

---

## Main Database Entities

### User
- Name
- Email
- Password
- Google authentication details where applicable

### Transaction
- User
- Title
- Amount
- Category
- Type
- Date
- Note

### Category
- User
- Name
- Type

### Budget
- User
- Category
- Amount
- Month
- Year

---

## UI Highlights

- Modern green finance dashboard theme
- Responsive sidebar and top navigation
- FinTrack brand identity with a coins icon
- Reusable forms and card components
- Clean transaction and budget management views
- Interactive financial charts
- Mobile-responsive layout

---

## Sample Dashboard Features

- Total Income card
- Total Expenses card
- Current Balance card
- Budget Usage card
- Expense Distribution Pie Chart
- Monthly Income vs Expenses Bar Chart
- Budget vs Actual Spending Chart
- Recent Transactions Table

---

## Security Notes

- Passwords are hashed using bcrypt
- JWT is used for authentication
- Protected routes require valid tokens
- Environment variables are stored outside the source code
- User financial data is scoped by authenticated user ID
- Real `.env` files are intentionally excluded from GitHub

---

## Submission Links

- GitHub Repository: `https://github.com/Nethmi-Hewasinghe/BudgetTracker.git`
- ER Diagram: `https://drive.google.com/file/d/1tEzR9hFwJrDZ9pmsZvfZukp_cwXWgMTe/view?usp=sharing`
- Presentation: `Add your presentation link here`
- Demo Video: `https://drive.google.com/file/d/1hwRdSbsKnMrdoU2mY7g1bI0FJHdbv4Sm/view?usp=sharing`

---

## Author

Developed as a technical assignment project for demonstrating full-stack MERN development skills.