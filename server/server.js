import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';

import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);

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