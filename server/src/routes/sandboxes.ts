import express from 'express';
import { SandboxManager } from '../services/SandboxManager';
import { logger } from '../utils/logger';

const router = express.Router();
const sandboxManager = new SandboxManager();

// Create new sandbox
router.post('/', async (req, res) => {
  try {
    const { projectId, template = 'nextjs-typescript', metadata = {} } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: 'projectId is required'
      });
    }

    const sandbox = await sandboxManager.createSandbox(projectId, {
      template,
      metadata
    });

    res.status(201).json({
      success: true,
      sandbox
    });

  } catch (error) {
    logger.error('Error creating sandbox:', error);
    res.status(500).json({
      error: 'Failed to create sandbox',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Execute command in sandbox
router.post('/:sandboxId/command', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({
        error: 'command is required'
      });
    }

    const result = await sandboxManager.executeCommand(sandboxId, command);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error executing command:', error);
    res.status(500).json({
      error: 'Failed to execute command'
    });
  }
});

// Write file to sandbox
router.post('/:sandboxId/files', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    const { path, content } = req.body;

    if (!path || content === undefined) {
      return res.status(400).json({
        error: 'path and content are required'
      });
    }

    const success = await sandboxManager.writeFile(sandboxId, path, content);

    if (success) {
      res.json({
        success: true,
        message: 'File written successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to write file'
      });
    }

  } catch (error) {
    logger.error('Error writing file:', error);
    res.status(500).json({
      error: 'Failed to write file'
    });
  }
});

// Read file from sandbox
router.get('/:sandboxId/files/*', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    const filePath = '/' + (req.params as any)[0]; // Get the full path after /files/

    const content = await sandboxManager.readFile(sandboxId, filePath);

    if (content !== null) {
      res.json({
        success: true,
        content
      });
    } else {
      res.status(404).json({
        error: 'File not found'
      });
    }

  } catch (error) {
    logger.error('Error reading file:', error);
    res.status(500).json({
      error: 'Failed to read file'
    });
  }
});

// Get file system structure
router.get('/:sandboxId/filesystem', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    const { path = '/' } = req.query;

    const fileSystem = await sandboxManager.getFileSystem(sandboxId, path as string);

    res.json({
      success: true,
      fileSystem
    });

  } catch (error) {
    logger.error('Error getting file system:', error);
    res.status(500).json({
      error: 'Failed to get file system'
    });
  }
});

// Install dependencies
router.post('/:sandboxId/install', async (req, res) => {
  try {
    const { sandboxId } = req.params;
    const { architecture } = req.body;

    const result = await sandboxManager.installDependencies(sandboxId, architecture);

    if (result.success) {
      res.json({
        success: true,
        message: 'Dependencies installed successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to install dependencies',
        details: result.error
      });
    }

  } catch (error) {
    logger.error('Error installing dependencies:', error);
    res.status(500).json({
      error: 'Failed to install dependencies'
    });
  }
});

// Delete sandbox
router.delete('/:sandboxId', async (req, res) => {
  try {
    const { sandboxId } = req.params;

    const success = await sandboxManager.deleteSandbox(sandboxId);

    if (success) {
      res.json({
        success: true,
        message: 'Sandbox deleted successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete sandbox'
      });
    }

  } catch (error) {
    logger.error('Error deleting sandbox:', error);
    res.status(500).json({
      error: 'Failed to delete sandbox'
    });
  }
});

export default router;