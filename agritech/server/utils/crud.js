const { Router } = require('express');
const h = require('./asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

const notFound = (res) => {
  res.status(404);
  throw new Error('Record not found');
};

// Owner-scoped CRUD: farmers see/edit only their own records, admins see everything.
exports.ownerCrud = (Model, { populate = '', beforeSave } = {}) => {
  const r = Router();
  r.use(protect);
  const scope = (req) => (req.user.role === 'admin' ? {} : { owner: req.user._id });
  const q = (query) => (populate ? query.populate(populate) : query);

  r.get('/', h(async (req, res) => res.json(await q(Model.find(scope(req)).sort('-createdAt')))));
  r.get('/:id', h(async (req, res) => {
    const d = await q(Model.findOne({ _id: req.params.id, ...scope(req) }));
    if (!d) notFound(res);
    res.json(d);
  }));
  r.post('/', h(async (req, res) => {
    const body = { ...req.body, owner: req.user._id };
    delete body._id;
    if (beforeSave) await beforeSave(req, body);
    const d = await Model.create(body);
    res.status(201).json(await q(Model.findById(d._id)));
  }));
  r.put('/:id', h(async (req, res) => {
    const d = await Model.findOne({ _id: req.params.id, ...scope(req) });
    if (!d) notFound(res);
    const body = { ...req.body };
    delete body._id;
    delete body.owner;
    if (beforeSave) await beforeSave(req, body, d);
    Object.assign(d, body);
    await d.save();
    res.json(await q(Model.findById(d._id)));
  }));
  r.delete('/:id', h(async (req, res) => {
    const d = await Model.findOne({ _id: req.params.id, ...scope(req) });
    if (!d) notFound(res);
    await d.deleteOne();
    res.json({ message: 'Deleted' });
  }));
  return r;
};

// Anyone logged in can read; only admins can write.
exports.adminWriteCrud = (Model) => {
  const r = Router();
  r.use(protect);
  r.get('/', h(async (req, res) => res.json(await Model.find().sort('-createdAt'))));
  r.post('/', protect, adminOnly, h(async (req, res) => {
    const body = { ...req.body, createdBy: req.user._id };
    delete body._id;
    res.status(201).json(await Model.create(body));
  }));
  r.put('/:id', adminOnly, h(async (req, res) => {
    const d = await Model.findById(req.params.id);
    if (!d) notFound(res);
    const body = { ...req.body };
    delete body._id;
    Object.assign(d, body);
    await d.save();
    res.json(d);
  }));
  r.delete('/:id', adminOnly, h(async (req, res) => {
    const d = await Model.findById(req.params.id);
    if (!d) notFound(res);
    await d.deleteOne();
    res.json({ message: 'Deleted' });
  }));
  return r;
};
