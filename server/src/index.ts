import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Import routes
import agentRoutes from './routes/agents';
import projectRoutes from './routes/projects';
import sandboxRoutes from './routes/sandboxes';
import conversationRoutes from './routes/conversations';

// Import socket handlers
import { initializeSocketHandlers } from './sockets/socketHandlers';

// Import agents and services
import { AgentOrchestrator } from './services/AgentOrchestrator';
import { SandboxManager } from './services/SandboxManager';
import { PlannerAgent } from './agents/PlannerAgent';
import { MainAgent } from './agents/MainAgent';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sandboxes', sandboxRoutes);
app.use('/api/conversations', conversationRoutes);

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  logger.info(`🚀 Beaver AI Server running on port ${PORT}`);
  logger.info(`📱 Client URL: ${process.env.CLIENT_URL}`);
  logger.info(`🌟 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { io };