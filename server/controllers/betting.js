const Betting = require('../models/betting');
const User = require('../models/User'); // Assuming users have a `coins` balance

// Admin creates a bet
exports.createBet = async (req, res) => {
    try {
        const { question, correctAnswer, price } = req.body;
        if (!["yes", "no"].includes(correctAnswer)) {
            return res.status(400).json({ error: "Correct answer must be 'yes' or 'no'" });
        }

        // Extract admin's user ID
        const adminId = req.user.id;

        const newBet = await Betting.create({ 
            userId: adminId,  // ✅ Assign admin ID
            question, 
            correctAnswer, 
            price 
        });

        res.status(201).json(newBet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// User places a bet
exports.placeBet = async (req, res) => {
    try {
        const { betId, userId, answer } = req.body;
        if (!["yes", "no"].includes(answer)) {
            return res.status(400).json({ error: "Answer must be 'yes' or 'no'" });
        }

        // Find the bet and ensure it's active
        const bet = await Betting.findById(betId);
        if (!bet || bet.status !== "active") {
            return res.status(400).json({ error: "Bet not found or is closed" });
        }

        // Ensure user has enough coins to match the price
        const user = await User.findById(userId);
        if (!user || user.coins < bet.price) {
            return res.status(400).json({ error: "Insufficient coins" });
        }

        // Deduct the exact bet price from the user's balance
        user.coins -= bet.price;
        await user.save();

        // Save response with fixed bet amount
        bet.responses.push({ userId, answer, betAmount: bet.price });
        await bet.save();

        res.status(200).json({ message: "Bet placed successfully", bet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all bets (admin only)
exports. getAllBets = async (req, res) => {
    try {
        // Fetch all bets
        const bets = await Betting.find();
        res.status(200).json(bets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Close bet and distribute winnings
exports.closeBet = async (req, res) => {
    try {
        const { betId } = req.params;
        const adminId = req.user.id;
        const bet = await Betting.findById(betId);

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        bet.status = "closed"; // Mark bet as closed

        let totalLosses = 0;
        let winners = [];

        // Check if all users answered correctly
        const allUsersWon = bet.responses.every(response => response.answer === bet.correctAnswer);

        if (allUsersWon) {
            // Refund each participant's bet amount since they all won
            for (const response of bet.responses) {
                const user = await User.findById(response.userId);
                if (user) {
                    user.coins += response.betAmount; // Refund bet amount
                    await user.save();
                }
            }

            await bet.save();
            return res.status(200).json({ message: "Bet closed, no money deducted or distributed", bet });
        }

        // Calculate total losses from incorrect answers
        for (const response of bet.responses) {
            if (response.answer !== bet.correctAnswer) {
                totalLosses += response.betAmount;
            }
        }

        // Identify winners
        const winningUsers = bet.responses.filter(response => response.answer === bet.correctAnswer);

        if (winningUsers.length > 0) {
            const winnerBonus = totalLosses * 0.8 / winningUsers.length;

            for (const winner of winningUsers) {
                const user = await User.findById(winner.userId);
                if (user) {
                    const winnings = winner.betAmount + winnerBonus;
                    user.coins += winnings;
                    await user.save();
                    winners.push({ userId: user._id, winnings });
                }
            }

            // Admin receives 20% of total losses
            const admin = await User.findById(adminId);
            if (admin) {
                admin.coins += totalLosses * 0.2;
                await admin.save();
            }

        } else {
            // If no winners, admin gets all the money
            const admin = await User.findById(adminId);
            if (admin) {
                admin.coins += totalLosses;
                await admin.save();
            }
        }

        bet.winners = winners;
        await bet.save();
        res.status(200).json({ message: "Bet closed, winnings distributed", bet });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Activate a bet (admin only)
exports.activateBet = async (req, res) => {
    try {
        const { betId} = req.params;
        const adminId = req.user.id;
        
        const bet = await Betting.findById(betId); // Find the bet
        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        // Ensure only the admin who created the bet can activate it
        if (bet.userId.toString() !== adminId) {
            return res.status(403).json({ error: "You are not authorized to activate this bet" });
        }

        bet.status = "active"; // Set the bet status to active
        await bet.save();
        res.status(200).json({ message: "Bet activated successfully", bet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};