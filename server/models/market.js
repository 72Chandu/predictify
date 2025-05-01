const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Market', marketSchema);