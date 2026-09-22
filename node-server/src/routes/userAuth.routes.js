const express = require('express');
const router = express.Router();
const { userLogin } = require('../controllers/userAuth.controller');

// POST /api/users/login — called by the Electron app
router.post('/login', userLogin);

module.exports = router;
