import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import Service from './models/Service.js';

import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import franchiseLeadRoutes from './routes/FranchiseLeadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables

dotenv.config();

console.log("SERVER EMAIL_USER =", process.env.EMAIL_USER);
console.log("SERVER EMAIL_PASS =", process.env.EMAIL_PASS);

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "FOUND" : "MISSING");

// Connect MongoDB
connectDB();

const app = express();

// Dynamic API responses should not be cached by browsers/CDNs in this app.
app.disable('etag');

// Middleware
const isProduction = process.env.NODE_ENV === 'production';
const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://mrwashwala-hwgn.vercel.app',
  'https://mkariappak-debug-mrwashwala.vercel.app',
];

const allowedOrigins = new Set([
  ...envOrigins,
  ...(isProduction ? [] : devOrigins),
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

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// =========================
// API Routes
// =========================

app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/franchise-leads', franchiseLeadRoutes);
app.use('/api/payments', paymentRoutes);

// =========================
// API Status Route
// =========================

app.get('/api-status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Mr. Washwala API is running smoothly',
    timestamp: new Date(),
  });
});

// =========================
// Test Route
// =========================

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'MongoDB Working Successfully',
  });
});

// =========================
// Debug Services Route
// =========================

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

// =========================
// Root Route
// =========================

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Mr. Washwala API Server</h1>
    <p>Running on Node.js + Express + MongoDB</p>
  `);
});

// =========================
// Error Handling Middleware
// =========================

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

// =========================
// Server Port
// =========================

const PORT = process.env.PORT || 5000;

// =========================
// Start Server
// =========================

app.listen(PORT, () => {
  console.log(
    `\x1b[35m%s\x1b[0m`,
    `Server is running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});