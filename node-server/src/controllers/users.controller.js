const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/admin/users — list all users (newest first)
exports.listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error('listUsers error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/users — add a single user
exports.addUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: `User "${email}" already exists.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase(), passwordHash]
    );

    return res.status(201).json({ message: 'User created.', user: result.rows[0] });
  } catch (err) {
    console.error('addUser error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/users/bulk — add multiple users from parsed CSV rows
// Body: { users: [{ email, password }, ...] }
exports.bulkAddUsers = async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'No user rows provided.' });
  }

  if (users.length > 500) {
    return res.status(400).json({ message: 'Maximum 500 users per bulk upload.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = [];
  const validRows = [];

  for (let i = 0; i < users.length; i++) {
    const { email, password } = users[i];
    const rowNum = i + 2; // +2 because row 1 is header

    if (!email || !emailRegex.test(email.trim())) {
      errors.push(`Row ${rowNum}: invalid email "${email}"`);
      continue;
    }
    if (!password || password.length < 6) {
      errors.push(`Row ${rowNum}: password too short for "${email}"`);
      continue;
    }
    validRows.push({ email: email.trim().toLowerCase(), password });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors in CSV.', errors });
  }

  // Insert rows, skip duplicates
  const results = { created: 0, skipped: 0, skippedEmails: [] };

  for (const row of validRows) {
    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [row.email]);
      if (existing.rows.length > 0) {
        results.skipped++;
        results.skippedEmails.push(row.email);
        continue;
      }
      const passwordHash = await bcrypt.hash(row.password, 10);
      await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [row.email, passwordHash]
      );
      results.created++;
    } catch (err) {
      console.error(`bulkAddUsers row error (${row.email}):`, err.message);
      results.skipped++;
      results.skippedEmails.push(row.email);
    }
  }

  return res.status(200).json({
    message: `Bulk import complete. ${results.created} created, ${results.skipped} skipped.`,
    created: results.created,
    skipped: results.skipped,
    skippedEmails: results.skippedEmails,
  });
};

// DELETE /api/admin/users/:id — remove a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ message: 'User deleted.' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};
