// EdgeTalk's own built-in local server, started by main.js when the app
// launches. For now it only exposes a health check — this is where
// on-system communication practice features (peer discovery, local
// session handling, etc.) will be added later.

const express = require('express');
const cors = require('cors');

function startLocalServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const PORT = process.env.LOCAL_SERVER_PORT || 4500;

  app.get('/status', (req, res) => {
    res.json({ status: 'ok', service: 'EdgeTalk local server' });
  });

  // Reserved for future endpoints (on-system communication practice).

  app.listen(PORT, () => {
    console.log(`🖥️  EdgeTalk built-in local server running on http://localhost:${PORT}`);
  });
}

module.exports = { startLocalServer };
