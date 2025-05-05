const express = require('express');
const router = express.Router();
const { createMarket, getAllMarkets, getMarketById, placeBet, resolveMarket } = require('../controllers/market');
const { isAuthenticated } = require('../middleware/authMiddleware');



router.post('/create', isAuthenticated, createMarket);
router.get('/', getAllMarkets);
router.get('/:id', getMarketById);
router.post('/:id/bet', isAuthenticated,placeBet);
router.post('/:id/resolve', isAuthenticated,resolveMarket);
module.exports = router;
