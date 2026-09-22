const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  listUsers,
  addUser,
  bulkAddUsers,
  deleteUser,
} = require('../controllers/users.controller');

// All routes below require a valid admin JWT
router.get('/', verifyToken, listUsers);
router.post('/', verifyToken, addUser);
router.post('/bulk', verifyToken, bulkAddUsers);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
