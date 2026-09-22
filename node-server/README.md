# node-server

Express API that owns the database. Right now it exposes just enough to
authenticate the single admin account.

## Setup

```bash
npm install
cp .env.example .env     # fill in your real Neon DATABASE_URL and JWT_SECRET
npm run seed:admin       # creates the one admin using ADMIN_EMAIL / ADMIN_PASSWORD from .env
npm run dev              # http://localhost:5000
```

## Endpoints

| Method | Path              | Auth        | Description                        |
|--------|-------------------|-------------|-------------------------------------|
| POST   | `/api/admin/login`| none        | Logs the admin in, returns a JWT    |
| GET    | `/api/admin/me`   | Bearer token| Returns the logged-in admin's info  |

## Structure

```
src/
├── index.js              # app entry point
├── config/db.js          # Neon Postgres connection pool
├── controllers/           # request handlers
├── routes/                 # route definitions
├── middleware/verifyToken.js
└── scripts/seedAdmin.js   # creates the one admin account
sql/schema.sql              # database schema
```
