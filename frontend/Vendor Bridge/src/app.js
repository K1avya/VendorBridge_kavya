require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFoundHandler } = require('./shared/middleware/errorHandler');
const authRoutes = require('./auth/routes/auth.routes');
const vendorRoutes = require('./vendor/routes/vendor.routes');
const rfqRoutes = require('./rfq/routes/rfq.routes');
const quotationRoutes = require('./quotation/routes/quotation.routes');
const approvalRoutes = require('./approval/routes/approval.routes');
const purchaseOrderRoutes = require('./purchaseOrder/routes/purchaseOrder.routes');
const invoiceRoutes = require('./invoice/routes/invoice.routes');
const activityRoutes = require('./activity/routes/activity.routes');

const app = express();

const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Rate limiter for auth routes (15 minutes, max 10 attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:5000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/vendors`, vendorRoutes);
app.use(`${API_PREFIX}/rfqs`, rfqRoutes);
app.use(`${API_PREFIX}/quotations`, quotationRoutes);
app.use(`${API_PREFIX}/approvals`, approvalRoutes);
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/activity`, activityRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
