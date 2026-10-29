
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

const {
  notFound,
  errorHandler
} = require('./middleware/error');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();

    res.json({
      ok: true,
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check DB error:', error.message);

    res.status(500).json({
      ok: false,
      database: 'disconnected'
    });
  }
});

// Connect database before processing API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/soil', require('./routes/soil'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/admin', require('./routes/admin'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export Express app for Vercel
module.exports = app;

// Start server only locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `AgriTech API running on http://localhost:${PORT}`
    );
  });
}
