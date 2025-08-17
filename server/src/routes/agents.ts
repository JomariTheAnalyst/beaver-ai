import express from 'express';
import { PrismaClient } from '@prisma/client';
import AIService from '../services/AIService';

const router = express.Router();

// Chat with AI agent
router.post('/chat', async (req, res) => {
  try {
    const { messages, projectContext, agentType = 'planner' } = req.body;
    const aiService: AIService = req.app.locals.aiService;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Process the chat message
    const response = await aiService.processChatMessage(messages, projectContext);

    // Log agent activity
    await prisma.agentActivity.create({
      data: {
        agentType: response.agentType,
        action: 'chat_response',
        status: 'COMPLETED',
        input: JSON.stringify({ messages, projectContext }),
        output: JSON.stringify(response),
        duration: 0, // We could measure this
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Generate code with AI agent
router.post('/generate-code', async (req, res) => {
  try {
    const { prompt, techStack, projectContext } = req.body;
    const aiService: AIService = req.app.locals.aiService;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const startTime = Date.now();
    const response = await aiService.generateCode(prompt, techStack || [], projectContext);
    const duration = Date.now() - startTime;

    // Log agent activity
    await prisma.agentActivity.create({
      data: {
        agentType: 'developer',
        action: 'code_generation',
        status: 'COMPLETED',
        input: JSON.stringify({ prompt, techStack, projectContext }),
        output: JSON.stringify(response),
        duration,
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error generating code:', error);
    
    // Log failed activity
    const prisma: PrismaClient = req.app.locals.prisma;
    await prisma.agentActivity.create({
      data: {
        agentType: 'developer',
        action: 'code_generation',
        status: 'FAILED',
        error: error.message,
        duration: 0,
      }
    });

    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Optimize code with AI agent
router.post('/optimize-code', async (req, res) => {
  try {
    const { code, language } = req.body;
    const aiService: AIService = req.app.locals.aiService;
    const prisma: PrismaClient = req.app.locals.prisma;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const startTime = Date.now();
    const response = await aiService.optimizeCode(code, language || 'javascript');
    const duration = Date.now() - startTime;

    // Log agent activity
    await prisma.agentActivity.create({
      data: {
        agentType: 'optimizer',
        action: 'code_optimization',
        status: 'COMPLETED',
        input: JSON.stringify({ code, language }),
        output: JSON.stringify(response),
        duration,
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error optimizing code:', error);
    res.status(500).json({ error: 'Failed to optimize code' });
  }
});

// Analyze images
router.post('/analyze-images', async (req, res) => {
  try {
    const { images } = req.body;
    const aiService: AIService = req.app.locals.aiService;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const analyses = await aiService.analyzeImages(images);

    res.json({
      analyses,
      count: images.length
    });
  } catch (error) {
    console.error('Error analyzing images:', error);
    res.status(500).json({ error: 'Failed to analyze images' });
  }
});

// Get agent activity logs
router.get('/activity', async (req, res) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { agentType, limit = 50, offset = 0 } = req.query;

    const where = agentType ? { agentType: agentType as string } : {};

    const activities = await prisma.agentActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.agentActivity.count({ where });

    res.json({
      activities,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error fetching agent activity:', error);
    res.status(500).json({ error: 'Failed to fetch agent activity' });
  }
});

// Get agent performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    // Get activity counts by agent type
    const agentCounts = await prisma.agentActivity.groupBy({
      by: ['agentType'],
      _count: {
        agentType: true
      }
    });

    // Get success/failure rates
    const statusCounts = await prisma.agentActivity.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get average response times
    const avgDurations = await prisma.agentActivity.groupBy({
      by: ['agentType'],
      _avg: {
        duration: true
      },
      where: {
        duration: {
          gt: 0
        }
      }
    });

    res.json({
      agentActivity: agentCounts,
      statusDistribution: statusCounts,
      averageResponseTimes: avgDurations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    res.status(500).json({ error: 'Failed to fetch agent metrics' });
  }
});

export default router;