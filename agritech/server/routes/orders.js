const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Resource = require('../models/Resource');

const r = Router();
r.use(protect);

const bad = (res, msg, code = 400) => {
  res.status(code);
  throw new Error(msg);
};

r.get('/', h(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  res.json(await Order.find(filter).populate('user', 'name email phone').sort('-createdAt'));
}));

// body: { items: [{resource, qty}], address }
r.post('/', h(async (req, res) => {
  const { items, address } = req.body;
  if (!address || !address.trim()) bad(res, 'Delivery address is required');
  if (!Array.isArray(items) || !items.length) bad(res, 'Cart is empty');
  const lines = [];
  let total = 0;
  for (const it of items) {
    const qty = Number(it.qty);
    if (!qty || qty < 1) bad(res, 'Invalid quantity');
    const p = await Resource.findById(it.resource);
    if (!p) bad(res, 'A product in your cart no longer exists');
    if (p.stock < qty) bad(res, `Only ${p.stock} ${p.unit} of ${p.name} in stock`);
    lines.push({ resource: p._id, name: p.name, price: p.price, qty });
    total += p.price * qty;
  }
  for (const l of lines) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: -l.qty } });
  const order = await Order.create({ user: req.user._id, items: lines, total, address });
  res.status(201).json(order);
}));

// Admin updates status; farmers may only cancel their own pending orders
r.patch('/:id/status', h(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) bad(res, 'Order not found', 404);
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    if (String(order.user) !== String(req.user._id)) bad(res, 'Not allowed', 403);
    if (status !== 'Cancelled' || order.status !== 'Pending') bad(res, 'You can only cancel pending orders', 403);
  }
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    for (const l of order.items) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: l.qty } });
  }
  order.status = status;
  await order.save();
  res.json(order);
}));

module.exports = r;
