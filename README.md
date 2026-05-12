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
- Example: `Rs. 25,000.00`

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
│   └── package.json
│
├── frontend/                React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
Local Setup Instructions
Prerequisites

Before running the project, install:

Node.js — LTS version recommended
npm
MongoDB Atlas account or local MongoDB database
Google Cloud OAuth Client ID for Google Sign-In
1. Backend Setup

Open a terminal in the project root and run:

cd backend
npm install

Create a .env file by copying .env.example.

macOS / Linux
cp .env.example .env
Windows PowerShell
Copy-Item .env.example .env

Then update the environment values inside backend/.env.

Start the backend server:

npm run dev

The API will run on:

http://localhost:5001

API base path:

http://localhost:5001/api
2. Frontend Setup

Open another terminal and run:

cd frontend
npm install

Create a .env file by copying .env.example.

macOS / Linux
cp .env.example .env
Windows PowerShell
Copy-Item .env.example .env

Start the frontend development server:

npm run dev

The frontend will run on:

http://localhost:5173
Environment Variables
backend/.env.example
NODE_ENV=development
PORT=5001

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174

GOOGLE_CLIENT_ID=your_google_web_client_id
frontend/.env.example
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id

Real .env files are not included in the repository for security reasons.

API Routes Summary
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login with email and password
POST	/api/auth/google	Login or register with Google Sign-In
GET	/api/auth/me	Get current logged-in user
Categories — Protected
Method	Endpoint	Description
GET	/api/categories?type=Income|Expense	Get user categories
POST	/api/categories	Create category
PUT	/api/categories/:id	Update category
DELETE	/api/categories/:id	Delete category
Transactions — Protected
Method	Endpoint	Description
GET	/api/transactions?type=&category=&startDate=&endDate=	Get filtered transactions
POST	/api/transactions	Create transaction
PUT	/api/transactions/:id	Update transaction
DELETE	/api/transactions/:id	Delete transaction
Budgets — Protected
Method	Endpoint	Description
GET	/api/budgets?month=&year=	Get budgets for a selected month/year
POST	/api/budgets	Create budget
PUT	/api/budgets/:id	Update budget
DELETE	/api/budgets/:id	Delete budget
Dashboard — Protected
Method	Endpoint	Description
GET	/api/dashboard?month=&year=	Get dashboard summary and chart data
Budget vs Actual Spending Logic

The application compares:

Budget amount: planned monthly spending for a selected category
Actual spending: total expense transactions recorded for that same category and month

Example:

Category	Budget	Actual Spending
Food	Rs. 20,000	Rs. 16,000
Transport	Rs. 10,000	Rs. 12,500
Entertainment	Rs. 15,000	Rs. 8,000

This helps users identify whether they are:

Under budget
Near the budget limit
Over budget
Authentication Flow
Email / Password Login
User submits login form
        ↓
Backend validates credentials
        ↓
JWT token is generated
        ↓
Frontend stores the token
        ↓
Protected API requests include the token
Google Sign-In
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
ER Diagram Description
Relationships
User 1 — N Transaction
User 1 — N Category
User 1 — N Budget
Category 1 — N Transaction
Category 1 — N Budget

Each user’s transactions, categories, and budgets are stored separately using the corresponding userId.

Main Database Entities
User
name
email
password
Google authentication details where applicable
Transaction
user
title
amount
category
type
date
note
Category
user
name
type
Budget
user
category
amount
month
year
UI Highlights
Modern green finance dashboard theme
Responsive sidebar and top navigation
FinTrack brand identity with a coins icon
Reusable forms and card components
Clean transaction and budget management views
Interactive financial charts
Mobile-responsive layout
Sample Dashboard Features
Total Income card
Total Expense card
Current Balance card
Budget Usage card
Expense Distribution Pie Chart
Monthly Income vs Expenses Chart
Budget vs Actual Spending Chart
Recent Transactions Table
Security Notes
Passwords are hashed using bcrypt
JWT is used for authentication
Protected routes require valid tokens
Environment variables are stored outside the source code
User financial data is scoped by authenticated user ID
Submission Links
GitHub Repository: Add your repository link here
ER Diagram: Add your diagram link here
Presentation: Add your presentation link here
Demo Video: Add your video link here
Author

Developed as a technical assignment project for demonstrating full-stack MERN development skills.