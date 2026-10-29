const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    areaAcres: { type: Number, min: 0 },
    sowingDate: Date,
    expectedHarvest: Date,
    status: { type: String, enum: ['Planned', 'Growing', 'Harvested'], default: 'Planned' },
    yieldKg: { type: Number, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);
