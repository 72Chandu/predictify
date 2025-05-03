const Market = require('../models/market');
const User = require('../models/User');
const Transaction = require('../models/transaction');

// Create a new market
exports.createMarket = async (req, res) => {
  try {
    const market = new Market({
      ...req.body,
      createdBy: req.user._id,
    });
    await market.save();
    res.status(201).json(market);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all markets
exports.getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find().sort({ createdAt: -1 });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get market by ID
exports.getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Place a bet on a market
exports.placeBet = async (req, res) => {
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

    user.coins -= amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'bet',
      amount: -amount,
      marketId: market._id,
      description: `Bet ${amount} on '${option}' in '${market.title}'`,
    });

    market.bets.push({ userId: user._id, option, amount });
    await market.save();

    res.json({ message: 'Bet placed', userCoins: user.coins, market });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Resolve market
exports.resolveMarket = async (req, res) => {
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

    await market.save();
    res.json({ message: 'Market resolved', market });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
