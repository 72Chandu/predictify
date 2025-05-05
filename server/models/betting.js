const mongoose = require('mongoose');

const BettingSchema = new mongoose.Schema({
  question: { type: String, required: true },
  price: { type: Number, default: 1 }, // Cost per bet (1 coin)
  responses: [{ userId: mongoose.Schema.Types.ObjectId, answer: String }],
  status: { type: String, enum: ["active", "closed"], default: "active" },
},{ timestamps: true });
module.exports = mongoose.model('beting', BettingSchema);