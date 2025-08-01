const express = require('express');
const router = express.Router();

// Handle login form submission
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Handle login logic here
  res.send('Login successful');
});

// Handle registration form submission
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  // Handle registration logic here
  res.send('Registration successful');
});

module.exports = router;
