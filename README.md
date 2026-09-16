# Bill Splitting App

A full-stack bill-splitting application built with React, TypeScript, Express, MongoDB, and Mongoose.

The application allows users to create groups, add members, record shared expenses, calculate balances, see who owes whom, and record payments when debts are settled.

## Features

- User registration and login
- Password hashing with Argon2id
- JWT authentication using HttpOnly cookies
- Protected API routes
- Create and view groups
- Add and remove group members
- Create shared expenses
- Choose which group members participate in an expense
- Split expenses equally between selected participants
- Automatically calculate balances
- Automatically calculate settlements
- Record payments with "Mark as paid"
- Recalculate balances after payments
- Responsive frontend layout

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS Modules

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

### Authentication

- Argon2id password hashing
- JWT
- HttpOnly cookies

## Architecture

The project uses a separate React frontend and Express REST API.

```text
React frontend
      ↓
Service layer / fetch
      ↓
Express REST API
      ↓
Authentication and authorization
      ↓
Business logic
      ↓
Mongoose
      ↓
MongoDB

The frontend communicates with the API through HTTP requests.

Business logic such as equal expense splitting, balance calculation, and settlement calculation is separated from the HTTP routes.

Important Technical Decisions
Money is stored as integers

Money is stored in minor units such as cents instead of floating-point numbers.

For example:

12.50 EUR → 1250 cents

This avoids floating-point precision problems when calculating and splitting expenses.

Expense splits are stored historically

Each expense stores the users who participated in that expense and their share.

This means that adding a new member to a group later does not change previous expenses.

Selective expense splitting

An expense can be split between all members or only selected members of the group.

The backend validates that every selected participant actually belongs to the group.

Authentication and authorization

Authentication verifies who the user is.

Authorization controls what the authenticated user is allowed to access.

For example, group routes check that the current user belongs to the requested group.

Payments and settlements

Settlements are calculated dynamically from the current balances.

When a user pays a debt, the application stores a separate Payment record instead of modifying the original expense.

This preserves the expense history while allowing balances and remaining settlements to be recalculated.

Local Setup
Requirements
Node.js 24+
npm
MongoDB
1. Clone the repository
git clone https://github.com/monika-hyperisland/Final-project.git
cd Final-project
2. Install frontend dependencies
npm install
3. Install backend dependencies
cd server
npm install
4. Backend environment variables

Create:

server/.env

The backend requires:

MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173

Do not commit real secrets to Git.

5. Frontend environment variables

Create:

.env

Add:

VITE_API_URL=http://localhost:3000
6. Start the backend

From the server directory:

npm run dev

The API runs locally on:

http://localhost:3000
7. Start the frontend

From the project root:

npm run dev

The frontend runs locally on:

http://localhost:5173
Build

Frontend:

npm run build

Backend:

cd server
npm run build

Project Status

The main MVP flow is implemented:

Register
→ Login
→ Create group
→ Add members
→ Add expenses
→ Select participants
→ Calculate balances
→ Calculate settlements
→ Mark debts as paid
→ Updated balances
→ Logout

## API Endpoints

### Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — log in
- `POST /api/auth/logout` — log out
- `GET /api/auth/me` — get the current authenticated user

### Groups

- `GET /api/groups` — get groups for the current user
- `POST /api/groups` — create a group
- `GET /api/groups/:id` — get one group
- `POST /api/groups/:id/members` — add a member
- `DELETE /api/groups/:id/members/:memberId` — remove a member

### Expenses

- `GET /api/groups/:id/expenses` — get group expenses
- `POST /api/groups/:id/expenses` — create an expense

### Balances and settlements

- `GET /api/groups/:id/balances` — calculate current balances
- `GET /api/groups/:id/settlements` — calculate who owes whom

### Payments

- `POST /api/groups/:id/payments` — record a completed settlement payment