// ============================================
// server/index.js
// Express Server Setup
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  signup,
  login,
  getUserById,
  checkUsernameAvailable,
  checkEmailAvailable,
  getUsers
} from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Request IP Extractor Middleware
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] 
    ? req.headers['x-forwarded-for'].split(',')[0] 
    : (req.ip || req.socket.remoteAddress);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/user/:userId', getUserById);
app.get('/api/auth/check-username', checkUsernameAvailable);
app.get('/api/auth/check-email', checkEmailAvailable);
app.get('/api/auth/users', getUsers);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Authentication Server Started        ║
╠════════════════════════════════════════════╣
║ Port:          ${PORT.toString().padEnd(28)}║
║ Frontend URL:  ${FRONTEND_URL.padEnd(28)}║
║ Environment:   ${(process.env.NODE_ENV || 'development').padEnd(28)}║
╚════════════════════════════════════════════╝
  `);

  // Validate environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  WARNING: Supabase credentials not found in .env');
  }
});
