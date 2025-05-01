const express = require("express");
const Market = require("../models/Market");
const router = express.Router();

// Create market
router.post("/create", async (req, res) => {
  const { question, category } = req.body;
  const market = await Market.create({ question, category });
  res.status(201).json(market);
});

// Get all markets
router.get("/", async (req, res) => {
  const markets = await Market.find();
  res.json(markets);
});

module.exports = router;
