const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
const compression = require('compression');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Compression — reduce payload ~70% ───────────────────────────────────────
app.use(compression());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ────────────────────────────────────────────────────────────
// Login: max 20 attempts per IP per 15 min — blocks brute force + bcrypt DoS
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
}));

// Submission: max 5 per student per hour — prevents deadline spam
app.use('/api/student/assignments', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.headers.authorization || req.ip,
  message: { message: 'Submission rate limit reached.' },
}));

// Global API: 300 req / min per IP — prevents runaway clients
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
}));

// ── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/admin/import', require('./routes/import'));
app.use('/api/teacher',      require('./routes/teacher'));
app.use('/api/student',      require('./routes/student'));
app.use('/api/notifications',require('./routes/notifications'));

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  uptime: process.uptime().toFixed(0) + 's',
  memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
  pid: process.pid,
}));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT} (PID ${process.pid})`));

// ── Keep-alive tuning — reduces connection churn under load ──────────────────
server.keepAliveTimeout = 65000;
server.headersTimeout   = 66000;
