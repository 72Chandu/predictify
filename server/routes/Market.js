const express = require('express');
const router = express.Router();
const Market = require('../models/market');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const protect = require('../middleware/authMiddleware');

// 1. Create a new market (protected route)
router.post('/create', protect, async (req, res) => {
  try {
    const market = new Market({
      ...req.body,
      createdBy: req.user._id, // Set creator from logged-in user
    });

    await market.save();
    res.status(201).json(market); // Send back created market
  } catch (err) {
    res.status(400).json({ error: err.message }); // Error handling
  }
});

// 2. Get all markets
router.get('/', async (req, res) => {
  try {
    const markets = await Market.find().sort({ createdAt: -1 });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get market by ID
router.get('/:id', async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Place a bet on a market (protected)
router.post('/:id/bet', protect, async (req, res) => {
  const { option, amount } = req.body;

  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });

    if (market.resolved) return res.status(400).json({ error: 'Market already resolved' });

    if (!market.options.includes(option)) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    const user = await User.findById(req.user._id);

    if (user.coins < amount) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Deduct coins and log transaction
    user.coins -= amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'bet',
      amount: -amount,
      marketId: market._id,
      description: `Bet ${amount} on '${option}' in '${market.title}'`,
    });

    // Add bet to market
    market.bets.push({ userId: user._id, option, amount });
    await market.save();

    res.json({ message: 'Bet placed', userCoins: user.coins, market });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Resolve market (protected)
router.post('/:id/resolve', protect, async (req, res) => {
  const { result } = req.body;

  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });

    if (market.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can resolve this market' });
    }

    if (!market.options.includes(result)) {
      return res.status(400).json({ error: 'Invalid result option' });
    }

    market.resolved = true;
    market.result = result;

    // Reward distribution
    const totalPot = market.bets.reduce((sum, bet) => sum + bet.amount, 0);
    const winners = market.bets.filter(bet => bet.option === result);
    const totalWinningAmount = winners.reduce((sum, bet) => sum + bet.amount, 0);

    if (totalWinningAmount > 0) {
      for (const bet of winners) {
        const user = await User.findById(bet.userId);
        const payout = (bet.amount / totalWinningAmount) * totalPot;
        const roundedPayout = Math.floor(payout);
        user.coins += roundedPayout;
        await user.save();

        // Log win transaction
        await Transaction.create({
          userId: user._id,
          type: 'win',
          amount: roundedPayout,
          marketId: market._id,
          description: `Won ${roundedPayout} in '${market.title}'`,
        });
      }
    }

    await market.save();

    res.json({ message: 'Market resolved and rewards distributed', market });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
