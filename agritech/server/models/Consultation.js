const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: String,
    subject: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'Answered', 'Resolved'], default: 'Open' },
    replies: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        byName: String,
        isExpert: Boolean,
        text: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
