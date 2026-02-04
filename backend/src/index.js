import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes & middleware
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

// Import services
import NotificationService from './services/NotificationService.js';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize notification service
const notificationService = new NotificationService(io);
app.locals.notificationService = notificationService;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`[Socket.io] User connected: ${socket.id}`);

  // Join rooms
  socket.on('join-tenant', (tenantId) => {
    socket.join(`tenant-${tenantId}`);
    console.log(`[Socket.io] Tenant ${tenantId} joined`);
  });

  socket.on('join-kasir', (counterId) => {
    socket.join(`kasir-${counterId}`);
    console.log(`[Socket.io] Kasir ${counterId} joined`);
  });

  socket.on('join-display', () => {
    socket.join('display');
    console.log(`[Socket.io] Display monitor joined`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Food Court POS Backend                ║
║  Server running on http://localhost:${PORT}     ║
║  Socket.io on ws://localhost:${PORT}           ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
╚════════════════════════════════════════╝
  `);
});

export { app, server, io, notificationService };
