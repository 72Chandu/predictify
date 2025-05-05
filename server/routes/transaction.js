const express = require('express');
const { createOrder, verifyAndConvertToCoins } = require('../controllers/transaction');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create-order', isAuthenticated, createOrder);// Create Razorpay order (client initiates)
router.post('/verify', isAuthenticated, verifyAndConvertToCoins);// Verify payment & convert INR to coins
module.exports = router;