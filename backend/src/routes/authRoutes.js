const express = require("express");

const {
register,
login,
} = require("../controllers/authController");

const router = express.Router();

// CUSTOMER SELF REGISTRATION
router.post("/register", register);

// COMMON LOGIN (ADMIN / STAFF / CUSTOMER)
router.post("/login", login);

module.exports = router;
