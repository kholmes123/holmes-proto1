const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const watermarkRoutes = require('./routes/watermarkRoutes');
const retrieveRoutes = require('./routes/retrieveRoutes'); // ✅ new


dotenv.config();
console.log('🔐 OMNISEAL_API_KEY:', process.env.OMNISEAL_API_KEY); // for Debug check that teh OmniSeal key was loaded correctly


const app = express();

const mongoose = require('mongoose');


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'piiredactor'
});

mongoose.connection.on('connected', () => {
  console.log('✅ Watermarking service connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Middleware

app.use(cors());
app.use(express.json());

app.use('/watermark', watermarkRoutes);
app.use('/retrieve', retrieveRoutes); // ✅ clean separation


const PORT = process.env.PORT || 3012;
app.listen(PORT, () => {
  console.log(`🖋️ Watermarking service running on port ${PORT}`);
});