const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();
dotenv.config(); // Load environment variables at the start


app.use(cookieParser())
// Import Routes
const marketRoutes = require('./routes/market');
const userRoutes = require('./routes/user');
const paymentRoutes=require('./routes/transaction')
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1",userRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/v1/payment', paymentRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Error: MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));