const express = require('express');
const { createBet, closeBet ,placeBet, getAllBets, activateBet} = require('../controllers/betting');
const { authenticateAdmin, isAuthenticated } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/user');
const router = express.Router();


// USER ROUTES
router.post('/betplace', isAuthenticated, placeBet); // Users place bets

// ADMIN ROUTES
router.post('/create', authenticateAdmin, createBet); // Admin creates a bet
router.put('/close/:betId', authenticateAdmin, closeBet); // Admin closes bet
router.get('/allbet', authenticateAdmin, getAllBets); // Admin views active bets
router.get('/users', authenticateAdmin, getAllUsers); // Admin views all users
router.put('/activate/:betId',authenticateAdmin, activateBet);
module.exports = router;
