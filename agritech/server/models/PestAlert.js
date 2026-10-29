const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    crop: { type: String, trim: true },
    region: { type: String, trim: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    description: { type: String, trim: true },
    prevention: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PestAlert', alertSchema);
