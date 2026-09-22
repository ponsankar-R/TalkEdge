const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// POST /api/users/login — used by the Electron app.
// Returns { valid: true, user: { id, email } } on success.
// No token / session is issued — the Electron app re-authenticates each launch.
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ valid: false, message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ valid: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ valid: false, message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      valid: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('userLogin error:', err.message);
    return res.status(500).json({ valid: false, message: 'Server error. Please try again.' });
  }
};
