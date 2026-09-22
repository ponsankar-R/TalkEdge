# admin-react-app

React admin panel UI. For this phase it only has a login screen and a
placeholder dashboard — no admin features are built yet.

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
```

Requires `node-server` to be running (see `../node-server/README.md`) and
an admin account to have been seeded with `npm run seed:admin`.

## Structure

```
src/
├── App.jsx            # routing: /login and / (protected)
├── pages/Login.jsx     # the only auth screen (no sign-up)
├── pages/Dashboard.jsx # placeholder, shown after login
├── api/auth.js         # calls node-server's /api/admin/login
└── styles/index.css
```
