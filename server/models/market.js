const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  description: String, //about game 
  title: {
    type: String,
    required: true,
  },
 options: {
    type: [String],
    required: true,
    validate: v => v.length >= 2 // at least two options
  },
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
