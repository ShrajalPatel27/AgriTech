const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');
const Consultation = require('../models/Consultation');

const r = Router();
r.use(protect);

const bad = (res, msg, code = 400) => {
  res.status(code);
  throw new Error(msg);
};

r.get('/', h(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { farmer: req.user._id };
  res.json(await Consultation.find(filter).sort('-updatedAt'));
}));

r.post('/', h(async (req, res) => {
  const { subject, question } = req.body;
  if (!subject || !question) bad(res, 'Subject and question are required');
  res.status(201).json(await Consultation.create({ farmer: req.user._id, farmerName: req.user.name, subject, question }));
}));

r.post('/:id/reply', h(async (req, res) => {
  const c = await Consultation.findById(req.params.id);
  if (!c) bad(res, 'Not found', 404);
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(c.farmer) !== String(req.user._id)) bad(res, 'Not allowed', 403);
  if (!req.body.text || !req.body.text.trim()) bad(res, 'Reply cannot be empty');
  c.replies.push({ by: req.user._id, byName: req.user.name, isExpert: isAdmin, text: req.body.text });
  if (isAdmin && c.status === 'Open') c.status = 'Answered';
  await c.save();
  res.json(c);
}));

r.patch('/:id/status', h(async (req, res) => {
  const c = await Consultation.findById(req.params.id);
  if (!c) bad(res, 'Not found', 404);
  if (req.user.role !== 'admin' && String(c.farmer) !== String(req.user._id)) bad(res, 'Not allowed', 403);
  c.status = req.body.status;
  await c.save();
  res.json(c);
}));

module.exports = r;
