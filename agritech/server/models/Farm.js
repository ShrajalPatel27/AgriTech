const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    village: { type: String, trim: true },
    state: { type: String, trim: true },
    lat: Number,
    lon: Number,
    areaAcres: { type: Number, min: 0 },
    soilType: { type: String, enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy'], default: 'Loamy' },
    waterSource: { type: String, enum: ['Rainfed', 'Canal', 'Borewell', 'Well', 'River', 'Drip'], default: 'Rainfed' },
  },
  { timestamps: true }
);

// Cascade: deleting a farm removes its crops and soil readings
farmSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Crop').deleteMany({ farm: this._id });
  await mongoose.model('Soil').deleteMany({ farm: this._id });
});

module.exports = mongoose.model('Farm', farmSchema);
