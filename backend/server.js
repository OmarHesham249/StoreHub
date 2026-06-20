require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'storehub-backend', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`[StoreHub] Backend running on port ${PORT}`);
});
