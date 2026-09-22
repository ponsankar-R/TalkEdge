// Connects to Neon PostgreSQL using a single shared connection pool.
// DATABASE_URL comes from .env (see .env.example for the expected format).

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️  DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
  process.exit(-1);
});

module.exports = pool;
