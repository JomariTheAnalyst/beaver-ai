import express from 'express';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ProjectStatus } from '@prisma/client';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create new project
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Project name is required'
      });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId: req.clerkId!,
          email: `dev-${req.clerkId}@example.com`, // Mock email for dev
          name: 'Development User'
        }
      });
      logger.info(`Created new user: ${user.id}`);
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
        status: ProjectStatus.PLANNING,
        metadata: {
          createdBy: 'user',
          version: '1.0.0'
        }
      }
    });

    logger.info(`Project created: ${project.id} by user ${user.id}`);

    res.status(201).json({
      success: true,
      project
    });

  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project'
    });
  }
});

// Get user projects
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.json({ success: true, projects: [] });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(projects);

  } catch (error) {
    logger.error('Error getting user projects:', error);
    res.status(500).json({
      error: 'Failed to get projects'
    });
  }
});

// Get specific project
router.get('/:projectId', async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: user.id 
      },
      include: {
        conversations: {
          take: 1,
          orderBy: { updatedAt: 'desc' }
        },
        _count: {
          select: {
            files: true,
            conversations: true,
            sandboxes: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    logger.error('Error getting project:', error);
    res.status(500).json({
      error: 'Failed to get project'
    });
  }
});

// Update project
router.put('/:projectId', async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, metadata } = req.body;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: user.id 
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(metadata && { metadata }),
        updatedAt: new Date()
      }
    });

    logger.info(`Project ${projectId} updated`);

    res.json({
      success: true,
      project: updatedProject
    });

  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project'
    });
  }
});

// Delete project
router.delete('/:projectId', async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkId! }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: user.id 
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    logger.info(`Project ${projectId} deleted`);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      error: 'Failed to delete project'
    });
  }
});

export default router;