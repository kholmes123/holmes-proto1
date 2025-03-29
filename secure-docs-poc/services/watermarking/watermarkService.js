const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const watermarkRoutes = require('./routes/watermarkRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/watermark', watermarkRoutes);

const PORT = process.env.PORT || 3012;
app.listen(PORT, () => {
  console.log(`🖋️ Watermarking service running on port ${PORT}`);
});