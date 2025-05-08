const mongoose = require('mongoose');

const BettingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  question: { 
    type: String, 
    required: [true, "Question is required"], 
    minlength: [5, "Question must be at least 5 characters long"] 
  },
  correctAnswer: { 
    type: String, 
    required: [true, "Correct answer is required"], 
    enum: ["yes", "no"] 
  }, // Admin sets the correct answer
  price: { 
    type: Number, 
    required: [true, "Price is required"], 
    min: [1, "Price must be at least 1"], 
    max: [100, "Price cannot exceed 100"] 
  }, // Cost per bet
  responses: [{ 
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, 
    answer: { 
      type: String, 
      required: [true, "Answer is required"], 
      enum: ["yes", "no"] 
    },
    betAmount: { 
      type: Number, 
      required: true
    }
  }],
  status: { 
    type: String, 
    enum: ["active", "closed"], 
    default: "active" 
  },
  totalLosses: { 
    type: Number, 
    default: 0 
  }, // Track total losses for winner payouts
  adminCommission: { 
    type: Number, 
    default: 0 
  }, // Track admin earnings
  winners: [{ 
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User"
    }, 
    winnings: { 
      type: Number, 
      default: 0 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Betting', BettingSchema);
