const Soil = require('../models/Soil');
const Farm = require('../models/Farm');
const { ownerCrud } = require('../utils/crud');

module.exports = ownerCrud(Soil, {
  populate: { path: 'farm', select: 'name' },
  beforeSave: async (req, body) => {
    if (body.farm) {
      const f = await Farm.findOne(req.user.role === 'admin' ? { _id: body.farm } : { _id: body.farm, owner: req.user._id });
      if (!f) {
        req.res.status(400);
        throw new Error('Farm not found');
      }
    }
    ['nitrogen', 'phosphorus', 'potassium', 'moisture', 'organicMatter', 'date'].forEach((k) => {
      if (body[k] === '') delete body[k];
    });
  },
});
