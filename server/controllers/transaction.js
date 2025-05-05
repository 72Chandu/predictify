const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { amount } = req.body; // INR
  try {
    const options = {
      amount: amount, // Razorpay uses paise so later multiply by 100
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order creation failed", error: err.message });
  }
};

exports.verifyAndConvertToCoins = async (req, res) => {  // it can done only after frontend is done
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, amount } = req.body;
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const coinsPerINR = 10; // Conversion rate
    const coins = amount * coinsPerINR;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.coins += coins;
    await user.save();

    await Transaction.create({userId: user._id, type: 'deposit',amount, coins,razorpayOrderId,razorpayPaymentId, razorpaySignature,description: `Converted ₹${amount} to ${coins} coins`,});
    res.status(200).json({ success: true, message: `${coins} coins added successfully`, coins: user.coins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};