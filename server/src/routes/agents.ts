import express from 'express';
import { PlannerAgent } from '../agents/PlannerAgent';
import { MainAgent } from '../agents/MainAgent';
import { SandboxManager } from '../services/SandboxManager';
import { AgentOrchestrator } from '../services/AgentOrchestrator';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize agents and services
const sandboxManager = new SandboxManager();
const plannerAgent = new PlannerAgent();
const mainAgent = new MainAgent(sandboxManager);
const orchestrator = new AgentOrchestrator();

// Register agents with orchestrator
orchestrator.registerAgent(plannerAgent);
orchestrator.registerAgent(mainAgent);

// Start conversation with Planner Agent
router.post('/chat', async (req, res) => {
  try {
    const { message, projectId, userId, conversationId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        error: 'Message and userId are required'
      });
    }

    const context = {
      projectId,
      userId,
      conversationId,
      timestamp: new Date()
    };

    const response = await orchestrator.processMessage(message, context);

    res.json({
      success: true,
      response,
      context: {
        projectId: context.projectId,
        conversationId: context.conversationId
      }
    });

  } catch (error) {
    logger.error('Error in agent chat:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get agent status
router.get('/status', async (req, res) => {
  try {
    const { projectId } = req.query;

    const status = orchestrator.getSystemStatus(projectId as string);

    res.json({
      success: true,
      status
    });

  } catch (error) {
    logger.error('Error getting agent status:', error);
    res.status(500).json({
      error: 'Failed to get agent status'
    });
  }
});

// Execute specific agent task
router.post('/task', async (req, res) => {
  try {
    const { agentType, taskType, input, projectId, userId } = req.body;

    if (!agentType || !taskType || !userId) {
      return res.status(400).json({
        error: 'agentType, taskType, and userId are required'
      });
    }

    const context = { projectId, userId, timestamp: new Date() };
    const result = await orchestrator.executeTask(agentType, taskType, input, context);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error executing agent task:', error);
    res.status(500).json({
      error: 'Failed to execute task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get conversation history
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required'
      });
    }

    const history = orchestrator.getConversationHistory(conversationId, userId as string);

    res.json({
      success: true,
      history
    });

  } catch (error) {
    logger.error('Error getting conversation history:', error);
    res.status(500).json({
      error: 'Failed to get conversation history'
    });
  }
});

// Stream agent response (for real-time updates)
router.get('/stream/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required'
      });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', projectId })}\n\n`);

    // Set up streaming for this project
    const streamHandler = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    orchestrator.addStreamListener(projectId, streamHandler);

    // Clean up on client disconnect
    req.on('close', () => {
      orchestrator.removeStreamListener(projectId, streamHandler);
      res.end();
    });

  } catch (error) {
    logger.error('Error setting up agent stream:', error);
    res.status(500).json({
      error: 'Failed to set up stream'
    });
  }
});

export default router;