const express = require("express");
const router = express.Router();
const { loginUser } = require("../services/auth.service");

// POST /auth/login  { "email": "...", "password": "..." }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;