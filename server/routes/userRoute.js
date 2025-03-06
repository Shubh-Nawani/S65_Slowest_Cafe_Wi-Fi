const express = require('express');
const { getUsers, signup, login, validateUser } = require('../controllers/userController');

const router = express.Router();

router.get("/", getUsers);
router.post("/signup",validateUser, signup);
router.post("/login", validateUser, login);

module.exports = router;