const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const usersRoutes = require('./users.routes');

// GET /api/admin/me — confirms the token is valid and returns the logged-in admin.
router.get('/me', verifyToken, (req, res) => {
  res.json({ admin: req.admin });
});

// User management routes — /api/admin/users/...
router.use('/users', usersRoutes);

module.exports = router;
