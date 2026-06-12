
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import Service from './models/Service.js';

import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  "https://mkariappak-debug-mrwashwala.vercel.app",
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// API Status Route
app.get('/api-status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Mr. Washwala API is running smoothly',
    timestamp: new Date(),
  });
});

// Test Route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'MongoDB Working Successfully',
  });
});

// DEBUG ROUTE
app.get('/debug-services', async (req, res) => {
  try {
    const services = await Service.find({});
    const count = await Service.countDocuments();

    res.json({
      success: true,
      count,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Mr. Washwala API Server</h1>
    <p>Running on Node.js + Express + MongoDB</p>
  `);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error',
  });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(
    `\x1b[35m%s\x1b[0m`,
    `Server is running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});