import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import concernsRoutes from './routes/concernsRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import followupsRoutes from './routes/followupsRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import inMemoryDb from './services/inMemoryDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
// CORS: allow configured origins or localhost defaults
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origin not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Synchronous fallback defaults so all routes and health check are immediately available
app.locals.useMemoryDb = true;
app.locals.inMemoryDb = inMemoryDb;

// Database Connection with graceful fallback
const connectDB = async () => {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    console.log('⚡ Using In-Memory Database Mode for out-of-the-box execution.');
    app.locals.useMemoryDb = true;
    app.locals.inMemoryDb = inMemoryDb;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careconnect_ai', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    app.locals.useMemoryDb = false;
  } catch (error) {
    console.warn(`MongoDB Connection Warning (${error.message}). Falling back to In-Memory Database.`);
    app.locals.useMemoryDb = true;
    app.locals.inMemoryDb = inMemoryDb;
  }
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CareConnect AI Backend',
    databaseMode: app.locals.useMemoryDb ? 'in-memory-fallback' : 'mongodb',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/concerns', concernsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ message: `API Route Not Found - ${req.originalUrl}` });
});
app.use(errorHandler);

// Start listening immediately so Vite proxy never hits ECONNREFUSED during startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CareConnect AI Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📡 Local Network/IPv4: http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process. Please close it or change PORT in server/.env.`);
    process.exit(1);
  } else {
    console.error(`❌ Server error:`, err.message);
  }
});

// Connect to MongoDB asynchronously without blocking server startup
connectDB();

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 5000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
