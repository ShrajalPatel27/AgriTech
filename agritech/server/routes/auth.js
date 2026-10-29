const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const h = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const r = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, location: u.location, language: u.language });
const bad = (res, msg) => {
  res.status(400);
  throw new Error(msg);
};

r.post('/register', h(async (req, res) => {
  const { name, email, password, phone, location, language } = req.body;
  if (!name || !name.trim()) bad(res, 'Name is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) bad(res, 'A valid email is required');
  if (!password || password.length < 6) bad(res, 'Password must be at least 6 characters');
  if (await User.findOne({ email: email.toLowerCase() })) bad(res, 'Email is already registered');
  const user = await User.create({ name, email, password, phone, location, language, role: 'farmer' }); // role is never taken from the client
  res.status(201).json({ token: sign(user), user: pub(user) });
}));

r.post('/login', h(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) bad(res, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json({ token: sign(user), user: pub(user) });
}));

r.get('/me', protect, (req, res) => res.json(pub(req.user)));

r.put('/me', protect, h(async (req, res) => {
  const u = await User.findById(req.user._id);
  ['name', 'phone', 'location', 'language'].forEach((k) => {
    if (req.body[k] !== undefined) u[k] = req.body[k];
  });
  if (req.body.password) {
    if (req.body.password.length < 6) bad(res, 'Password must be at least 6 characters');
    u.password = req.body.password;
  }
  await u.save();
  res.json(pub(u));
}));

module.exports = r;
