const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Seeds', 'Fertilizer', 'Pesticide', 'Tools', 'Equipment'], default: 'Seeds' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    stock: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
