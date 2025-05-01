const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Email already in use' });

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ 
      token: generateToken(user), 
      user: { id: user._id, username: user.username } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    res.json({ 
      token: generateToken(user), 
      user: { id: user._id, username: user.username } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
