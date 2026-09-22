# TalkEdge

Monorepo scaffold for the **EdgeTalk** communication-practice system. This is
a structural setup only — no feature logic beyond a single working admin
login. Everything else (practice sessions, on-system communication, user
management, etc.) is intentionally left for later.

## Folders

```
TalkEdge/
├── admin-react-app/   React admin panel (UI only — one login screen for now)
├── node-server/       Express API — owns the database, authenticates the admin
└── electron-app/      Desktop app — intro/login screen + its own built-in local server
```

### How the pieces talk to each other

```
┌─────────────────────┐        ┌──────────────────────┐        ┌───────────────────────┐
│  admin-react-app     │  HTTP  │   node-server          │  SQL   │  Neon PostgreSQL        │
│  (Vite + React)      │──────▶│   (Express + JWT)      │──────▶│  (admins table)         │
│  http://localhost:5173│       │   http://localhost:5000│        │  cloud-hosted           │
└─────────────────────┘        └──────────────────────┘        └───────────────────────┘

┌─────────────────────────────────────────────┐
│  electron-app                                 │
│  ├─ Renderer: intro/login screen (EdgeTalk)   │
│  └─ Built-in local Express server             │
│     http://localhost:4500  (reserved for      │
│     future on-system communication features)  │
└─────────────────────────────────────────────┘
```

Only the admin login is wired end-to-end right now. The Electron app's login
screen is a finished design and calls a placeholder handler — it isn't
connected to a live auth endpoint yet, since regular user accounts aren't
part of this phase.

## 1. node-server — set up first

```bash
cd node-server
npm install
cp .env.example .env      # then fill in your real Neon connection string + secrets
npm run seed:admin        # creates the ONE admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env
npm run dev                # starts the API on http://localhost:5000
```

Get your Neon connection string from the Neon dashboard → your project →
**Connection Details** → copy the "Pooled connection" string. Paste it into
`DATABASE_URL` in `.env`.

## 2. admin-react-app

```bash
cd admin-react-app
npm install
npm run dev                # http://localhost:5173
```

Log in with the email/password you set in `node-server/.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`) after running the seed script.

## 3. electron-app

```bash
cd electron-app
npm install
npm start
```

This opens the EdgeTalk desktop intro/login screen and also boots the
app's own built-in local server (see `server/index.js`) in the background,
which is where future on-system communication features will live.

## Notes

- All `.env` files in this repo contain **placeholder values only**. Replace
  them with real credentials before running anything against a live database.
- Never commit real `.env` files — each package's `.gitignore` already
  excludes them.
- Password hashing uses bcrypt; authentication uses signed JWTs.
