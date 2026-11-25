# Office Attendance - React + Node.js + MySQL

## Requirements
Node.js 18+ and MySQL 8 running on your computer.

## 1. Backend
    cd backend
    npm install
    copy .env.example to .env  (Mac/Linux: cp .env.example .env)
    edit .env -> put your MySQL password and a JWT_SECRET
    npm run setup      (creates database, tables, demo users - run once)
    npm start          (API on http://localhost:5000)

## 2. Frontend (new terminal)
    cd frontend
    npm install
    npm run dev        (opens http://localhost:5173)

## Demo logins
- Admin:    admin / admin123
- Employee: john  / john123

## Structure
backend/server.js   API routes (login, check-in/out, admin)
backend/schema.sql  MySQL tables
backend/setup.js    creates DB + demo users
frontend/src/       React pages (Login, Dashboard, Admin)
