const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_LOGIN_EMAIL || password !== process.env.ADMIN_LOGIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  return res.json({
    message: 'Login successful.',
    token: process.env.ADMIN_ACCESS_TOKEN,
  });
});

module.exports = router;