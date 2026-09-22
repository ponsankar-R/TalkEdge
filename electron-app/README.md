# electron-app

The EdgeTalk desktop shell. Two things live here:

1. **Intro / login screen** (`src/index.html`, `styles.css`, `renderer.js`)
   — a finished, single-screen design (no vertical scroll). The four
   practice skills (Listening, Reading, Speaking, Writing) radiate from the
   central "EdgeTalk" hub, with a login form alongside. There is no sign-up
   screen by design. The form is validated and ready to wire up, but doesn't
   call a real API yet — that's future work.

2. **Built-in local server** (`server/index.js`) — a small Express server
   started by `main.js` when the app launches. It only exposes a `/status`
   health check right now; this is where on-system communication practice
   features will be added later.

## Run it

```bash
npm install
npm start
```

## Structure

```
main.js         # Electron main process — creates the window, starts the local server
preload.js      # exposes a small, safe API to the renderer (window.edgeTalk)
server/index.js # built-in local Express server (scaffold)
src/
├── index.html  # intro/login screen markup
├── styles.css  # full visual design (hub-and-spoke diagram, login card)
└── renderer.js # form validation + placeholder submit handler
```
