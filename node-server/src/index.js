require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userAuthRoutes = require('./routes/userAuth.routes');

const app = express();

app.use(helmet());
app.use(morgan('dev'));

// Allow the admin React app and Electron (which sends a null Origin via file://)
const allowedOrigins = [
  process.env.ADMIN_CLIENT_ORIGIN || 'http://localhost:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Electron file://, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'TalkEdge Node Server' });
});

// Admin auth + admin-only routes (user management)
app.use('/api/admin', authRoutes);
app.use('/api/admin', adminRoutes);

// Electron user login (no admin token required)
app.use('/api/users', userAuthRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TalkEdge server running on http://localhost:${PORT}`);
});
