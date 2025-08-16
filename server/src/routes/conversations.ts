import express from 'express';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { MessageRole } from '@prisma/client';
import { AgentOrchestrator } from '../services/AgentOrchestrator';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create new conversation
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId, title, initialMessage } = req.body;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify project ownership if projectId is provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { 
          id: projectId,
          userId: user.id 
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        projectId,
        title: title || 'New Conversation'
      }
    });

    // If there's an initial message, add it and get AI response
    if (initialMessage) {
      const userMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: initialMessage,
          role: MessageRole.USER
        }
      });

      // Get AI response via Agent Orchestrator
      try {
        const orchestrator = new AgentOrchestrator();
        const aiResponse = await orchestrator.processMessage(initialMessage, {
          conversationId: conversation.id,
          projectId,
          userId: user.id
        });

        if (aiResponse) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: aiResponse.content,
              role: MessageRole.ASSISTANT,
              agentType: aiResponse.agentType || 'planner'
            }
          });
        }
      } catch (aiError) {
        logger.error('Error getting AI response:', aiError);
        // Continue without AI response for now
      }
    }

    logger.info(`Conversation created: ${conversation.id} for user ${user.id}`);

    res.status(201).json({
      success: true,
      conversation
    });

  } catch (error) {
    logger.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Failed to create conversation'
    });
  }
});

// Get user conversations
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.query;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.json({ success: true, conversations: [] });
    }

    const conversations = await prisma.conversation.findMany({
      where: { 
        userId: user.id,
        ...(projectId && { projectId: projectId as string })
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    logger.error('Error getting conversations:', error);
    res.status(500).json({
      error: 'Failed to get conversations'
    });
  }
});

// Get specific conversation with messages
router.get('/:conversationId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: user.id 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        project: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      conversation
    });

  } catch (error) {
    logger.error('Error getting conversation:', error);
    res.status(500).json({
      error: 'Failed to get conversation'
    });
  }
});

// Add message to conversation
router.post('/:conversationId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    const { content, role = MessageRole.USER } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Message content is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: user.id 
      },
      include: { project: true }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create user message
    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        role
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Get AI response if it's a user message
    if (role === MessageRole.USER) {
      try {
        const orchestrator = new AgentOrchestrator();
        const aiResponse = await orchestrator.processMessage(content, {
          conversationId,
          projectId: conversation.projectId,
          userId: user.id
        });

        if (aiResponse) {
          const aiMessage = await prisma.message.create({
            data: {
              conversationId,
              content: aiResponse.content,
              role: MessageRole.ASSISTANT,
              agentType: aiResponse.agentType || 'planner'
            }
          });

          res.status(201).json({
            success: true,
            messages: [message, aiMessage]
          });
          return;
        }
      } catch (aiError) {
        logger.error('Error getting AI response:', aiError);
      }
    }

    logger.info(`Message added to conversation ${conversationId}`);

    res.status(201).json({
      success: true,
      message
    });

  } catch (error) {
    logger.error('Error adding message:', error);
    res.status(500).json({
      error: 'Failed to add message'
    });
  }
});

// Delete conversation
router.delete('/:conversationId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: user.id 
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    logger.info(`Conversation ${conversationId} deleted`);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({
      error: 'Failed to delete conversation'
    });
  }
});

export default router;