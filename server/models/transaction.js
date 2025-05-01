// server/models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bet', 'win', 'refund'], required: true },
  amount: { type: Number, required: true },
  marketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Market' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
