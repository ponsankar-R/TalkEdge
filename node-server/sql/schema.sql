-- TalkEdge database schema
-- Run against your Neon PostgreSQL database (the seed script also creates
-- these tables automatically the first time it runs).

-- Admin accounts (only one allowed: admin@talkedge.com)
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- End-user accounts (managed by admin, used to log in via Electron app)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  -- Progress is stored as a JSONB object keyed by module name.
  -- Example: { "reading": { "sessions": 3, "score": 87 }, "listening": {...} }
  progress      JSONB NOT NULL DEFAULT '{}'
);

-- Future: practice_sessions table for per-session granular data
-- CREATE TABLE IF NOT EXISTS practice_sessions ( ... );
