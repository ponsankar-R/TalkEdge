const { contextBridge } = require('electron');
require('dotenv').config();

// Safely exposes a small, read-only API to the renderer (login screen).
// Extend this as real features (auth calls, local-server calls, IPC) are added.
contextBridge.exposeInMainWorld('edgeTalk', {
  version: '1.0.0',
  backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:5000',
  localServerUrl: `http://localhost:${process.env.LOCAL_SERVER_PORT || 4500}`,
});
