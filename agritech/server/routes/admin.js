const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Soil = require('../models/Soil');
const Order = require('../models/Order');
const Post = require('../models/Post');
const Consultation = require('../models/Consultation');

const r = Router();
r.use(protect, adminOnly);

r.get('/stats', h(async (req, res) => {
  const [users, farms, crops, orders, openQuestions, posts, revenue] = await Promise.all([
    User.countDocuments(),
    Farm.countDocuments(),
    Crop.countDocuments(),
    Order.countDocuments(),
    Consultation.countDocuments({ status: 'Open' }),
    Post.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);
  res.json({ users, farms, crops, orders, openQuestions, posts, revenue: revenue[0]?.total || 0 });
}));

r.get('/users', h(async (req, res) => res.json(await User.find().select('-password').sort('-createdAt'))));

r.patch('/users/:id/role', h(async (req, res) => {
  if (!['farmer', 'admin'].includes(req.body.role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot change your own role');
  }
  const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json(u);
}));

r.delete('/users/:id', h(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete yourself');
  }
  const farms = await Farm.find({ owner: req.params.id });
  for (const f of farms) await f.deleteOne();
  await Promise.all([Crop.deleteMany({ owner: req.params.id }), Soil.deleteMany({ owner: req.params.id }), Order.deleteMany({ user: req.params.id })]);
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User and related data deleted' });
}));

module.exports = r;
