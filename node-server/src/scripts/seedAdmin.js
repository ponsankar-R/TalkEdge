// Creates the ONE admin account allowed to log in, using ADMIN_EMAIL /
// ADMIN_PASSWORD from .env. Also ensures all required tables exist.
// Safe to run multiple times — it skips creation if an admin with that
// email already exists.
//
// Usage: npm run seed:admin

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  try {
    // Ensure admins table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW(),
        progress      JSONB NOT NULL DEFAULT '{}'
      );
    `);

    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log(`ℹ️  Admin "${email}" already exists — updating password.`);
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, email]
      );
      console.log(`✅ Admin password updated for: ${email}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    );

    console.log(`✅ Admin account created: ${email}`);
    console.log(`✅ Users table ready.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
