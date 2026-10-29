const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

const r = Router();
r.use(protect);

const bad = (res, msg, code = 400) => {
  res.status(code);
  throw new Error(msg);
};

r.get('/', h(async (req, res) => res.json(await Post.find().sort('-createdAt'))));

r.post('/', h(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) bad(res, 'Title and message are required');
  res.status(201).json(await Post.create({ author: req.user._id, authorName: req.user.name, title, body }));
}));

r.post('/:id/comments', h(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) bad(res, 'Post not found', 404);
  if (!req.body.text || !req.body.text.trim()) bad(res, 'Comment cannot be empty');
  p.comments.push({ author: req.user._id, authorName: req.user.name, text: req.body.text });
  await p.save();
  res.json(p);
}));

r.delete('/:id', h(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) bad(res, 'Post not found', 404);
  if (req.user.role !== 'admin' && String(p.author) !== String(req.user._id)) bad(res, 'Not allowed', 403);
  await p.deleteOne();
  res.json({ message: 'Deleted' });
}));

module.exports = r;
