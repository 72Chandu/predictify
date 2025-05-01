const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const marketRoutes = require('./routes/market');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your MongoDB Atlas URI
mongoose.connect(process.env.MONGO_URI || 'your-atlas-uri-here')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/markets', marketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
