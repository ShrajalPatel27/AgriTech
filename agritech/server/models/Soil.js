const mongoose = require('mongoose');
const analyzeSoil = require('../utils/soil');

const soilSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    date: { type: Date, default: Date.now },
    ph: { type: Number, min: 0, max: 14, required: true },
    nitrogen: { type: Number, min: 0 },
    phosphorus: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
    moisture: { type: Number, min: 0, max: 100 },
    organicMatter: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

soilSchema.virtual('analysis').get(function () {
  return analyzeSoil(this);
});

module.exports = mongoose.model('Soil', soilSchema);
