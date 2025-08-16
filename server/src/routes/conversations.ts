import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Create new conversation
router.post('/', async (req, res) => {
  try {
    const { userId, projectId, title } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required'
      });
    }

    const conversation = {
      id: `conv_${Date.now()}`,
      userId,
      projectId,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.info(`Conversation created: ${conversation.id} for user ${userId}`);

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
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock conversations data
    const conversations = [
      {
        id: 'conv_1',
        userId,
        projectId: 'project_1',
        title: 'Task Management App Planning',
        messageCount: 15,
        lastMessage: 'Great! The project structure looks good.',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      },
      {
        id: 'conv_2',
        userId,
        projectId: 'project_2',
        title: 'E-commerce Platform Discussion',
        messageCount: 8,
        lastMessage: 'Let me create the blueprint for your e-commerce platform.',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 3600000)
      }
    ];

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
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Mock conversation with messages
    const conversation = {
      id: conversationId,
      userId: 'user_123',
      projectId: 'project_1',
      title: 'Task Management App Planning',
      messages: [
        {
          id: 'msg_1',
          content: 'I want to build a task management app with real-time collaboration.',
          role: 'user',
          createdAt: new Date(Date.now() - 7200000)
        },
        {
          id: 'msg_2',
          content: 'Great! I understand you want to build a task management app with real-time collaboration. Let me ask a few questions to better understand your vision...',
          role: 'assistant',
          agentType: 'planner',
          createdAt: new Date(Date.now() - 7180000)
        }
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date()
    };

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
router.post('/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, role = 'user', agentType } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'content is required'
      });
    }

    const message = {
      id: `msg_${Date.now()}`,
      content,
      role,
      agentType,
      createdAt: new Date()
    };

    logger.info(`Message added to conversation ${conversationId}: ${content.substring(0, 100)}...`);

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
router.delete('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Here you would delete the conversation from the database
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