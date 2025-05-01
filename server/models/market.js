const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  }
});

const marketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  options: {
    type: [String],
    required: true,
    validate: v => v.length >= 2 // at least two options
  },
  bets: [betSchema],
  category: {
    type: String,
    enum: ['crypto', 'sports', 'politics', 'tech', 'other'],
    default: 'other',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  result: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Market', marketSchema);
