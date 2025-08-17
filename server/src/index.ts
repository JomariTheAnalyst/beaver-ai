import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import services
import AIService from './services/AIService';
import E2BSandboxService from './services/E2BSandboxService';
import { PrismaClient } from '@prisma/client';

// Import routes
import projectRoutes from './routes/projects';
import conversationRoutes from './routes/conversations';
import agentRoutes from './routes/agents';
import sandboxRoutes from './routes/sandboxes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Import socket handlers
import { setupSocketHandlers } from './sockets/socketHandlers';

// Load environment variables
dotenv.config();

// Initialize services
const prisma = new PrismaClient();
const aiService = new AIService({
  geminiApiKey: process.env.GEMINI_API_KEY!,
  openRouterApiKey: process.env.OPENROUTER_API_KEY!,
});
const e2bService = new E2BSandboxService({
  apiKey: process.env.E2B_API_KEY!,
});

// Create Express app
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Make services available to routes
app.locals.aiService = aiService;
app.locals.e2bService = e2bService;
app.locals.prisma = prisma;
app.locals.io = io;

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test AI service connection
    const aiConnected = await aiService.testConnection();
    
    // Test E2B service connection
    const e2bConnected = await e2bService.testConnection();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: true,
        ai: aiConnected,
        e2b: e2bConnected
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service health check failed'
    });
  }
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/sandboxes', sandboxRoutes);

// Image analysis endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Analyze image with AI service
    const analyses = await aiService.analyzeImages([imageData]);
    
    res.json({
      analysis: analyses[0] || 'Unable to analyze image',
      filename
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, projectContext, conversationId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Process chat message with AI service
    const aiResponse = await aiService.processChatMessage(messages, projectContext);

    // Save conversation to database if conversationId provided
    if (conversationId) {
      const lastMessage = messages[messages.length - 1];
      
      // Save user message
      await prisma.message.create({
        data: {
          conversationId,
          content: lastMessage.content,
          role: lastMessage.role,
          images: lastMessage.images ? JSON.stringify(lastMessage.images) : null,
        }
      });

      // Save AI response
      await prisma.message.create({
        data: {
          conversationId,
          content: aiResponse.content,
          role: 'assistant',
          agentType: aiResponse.agentType,
          metadata: aiResponse.metadata ? JSON.stringify(aiResponse.metadata) : null,
        }
      });
    }

    // Emit real-time update via Socket.IO
    if (conversationId) {
      io.to(`conversation:${conversationId}`).emit('new_message', {
        content: aiResponse.content,
        role: 'assistant',
        agentType: aiResponse.agentType,
        timestamp: new Date().toISOString()
      });
    }

    res.json(aiResponse);
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Code generation endpoint
app.post('/api/generate-code', async (req, res) => {
  try {
    const { prompt, techStack, projectContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const codeResponse = await aiService.generateCode(prompt, techStack || [], projectContext);
    
    res.json(codeResponse);
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Setup Socket.IO handlers
setupSocketHandlers(io, { aiService, e2bService, prisma });

// Start server
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Beaver AI Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close database connection
  await prisma.$disconnect();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

export default app;