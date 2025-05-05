const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'bet', 'win', 'refund'],
    required: true
  },
  amount: {   // INR amount paid (e.g., ₹50)
    type: Number,
    required: true,
    min: [0, "Amount must be positive"]
  },
  coins: {   // Coins earned from the transaction (e.g., 500 coins for ₹50 deposit)
    type: Number,
    min: 0
  },
  razorpayPaymentId: { // Optional Razorpay fields for 'deposit' type
    type: String
  },
  razorpayOrderId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  marketId: {   // For betting-related transactions
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market'
  },
  description: {  // Optional description for clarity
    type: String
  },
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transactionSchema);