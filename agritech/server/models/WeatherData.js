const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true }, // "lat,lon" rounded
    lat: Number,
    lon: Number,
    current: mongoose.Schema.Types.Mixed,
    daily: [mongoose.Schema.Types.Mixed],
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeatherData', weatherSchema);
