import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { AgentOrchestrator } from '../services/AgentOrchestrator';
import { SandboxManager } from '../services/SandboxManager';

const orchestrator = new AgentOrchestrator();
const sandboxManager = new SandboxManager();

interface SocketWithAuth extends Socket {
  userId?: string;
  projectId?: string;
}

export function initializeSocketHandlers(io: Server): void {
  io.on('connection', (socket: SocketWithAuth) => {
    logger.info(`Client connected: ${socket.id}`);

    // Authentication middleware
    socket.use((packet, next) => {
      const token = packet[1]?.auth?.token;
      // Here you would validate the token with Clerk
      // For now, we'll accept any connection
      socket.userId = packet[1]?.auth?.userId || 'anonymous';
      next();
    });

    // Join project room
    socket.on('join_project', (data: { projectId: string; userId: string }) => {
      const { projectId, userId } = data;
      
      socket.projectId = projectId;
      socket.userId = userId;
      socket.join(`project:${projectId}`);
      
      logger.info(`User ${userId} joined project ${projectId}`);
      
      socket.emit('joined_project', { 
        success: true, 
        projectId,
        message: 'Connected to project workspace' 
      });
    });

    // Handle agent chat messages
    socket.on('agent_message', async (data: { 
      message: string;
      projectId?: string;
      conversationId?: string;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { message, projectId, conversationId } = data;

        // Emit typing indicator
        if (projectId) {
          socket.to(`project:${projectId}`).emit('agent_typing', {
            agentType: 'planner',
            isTyping: true
          });
        }

        const context = {
          projectId: projectId || socket.projectId,
          userId: socket.userId,
          conversationId,
          timestamp: new Date()
        };

        const response = await orchestrator.processMessage(message, context);

        // Stop typing indicator
        if (projectId) {
          socket.to(`project:${projectId}`).emit('agent_typing', {
            agentType: response.agentType,
            isTyping: false
          });
        }

        // Emit response to user
        socket.emit('agent_response', {
          success: true,
          response,
          conversationId: context.conversationId
        });

        // Emit to project room if applicable
        if (projectId) {
          socket.to(`project:${projectId}`).emit('project_update', {
            type: 'agent_response',
            agentType: response.agentType,
            message: response.message,
            timestamp: new Date()
          });
        }

      } catch (error) {
        logger.error('Error processing agent message:', error);
        socket.emit('agent_error', {
          error: 'Failed to process message',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle sandbox commands
    socket.on('sandbox_command', async (data: {
      sandboxId: string;
      command: string;
    }) => {
      try {
        const { sandboxId, command } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        logger.info(`Executing command in sandbox ${sandboxId}: ${command}`);

        const result = await sandboxManager.executeCommand(sandboxId, command);

        socket.emit('sandbox_command_result', {
          success: true,
          sandboxId,
          command,
          result
        });

        // Emit to project room
        if (socket.projectId) {
          socket.to(`project:${socket.projectId}`).emit('project_update', {
            type: 'sandbox_command',
            sandboxId,
            command,
            result,
            userId: socket.userId,
            timestamp: new Date()
          });
        }

      } catch (error) {
        logger.error('Error executing sandbox command:', error);
        socket.emit('sandbox_error', {
          error: 'Failed to execute command',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle file operations
    socket.on('write_file', async (data: {
      sandboxId: string;
      path: string;
      content: string;
    }) => {
      try {
        const { sandboxId, path, content } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const success = await sandboxManager.writeFile(sandboxId, path, content);

        socket.emit('file_written', {
          success,
          sandboxId,
          path,
          message: success ? 'File written successfully' : 'Failed to write file'
        });

        // Emit file change to project room
        if (success && socket.projectId) {
          socket.to(`project:${socket.projectId}`).emit('file_changed', {
            type: 'file_written',
            sandboxId,
            path,
            userId: socket.userId,
            timestamp: new Date()
          });
        }

      } catch (error) {
        logger.error('Error writing file:', error);
        socket.emit('file_error', {
          error: 'Failed to write file',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    socket.on('read_file', async (data: {
      sandboxId: string;
      path: string;
    }) => {
      try {
        const { sandboxId, path } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const content = await sandboxManager.readFile(sandboxId, path);

        socket.emit('file_content', {
          success: content !== null,
          sandboxId,
          path,
          content
        });

      } catch (error) {
        logger.error('Error reading file:', error);
        socket.emit('file_error', {
          error: 'Failed to read file',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle file system requests
    socket.on('get_filesystem', async (data: {
      sandboxId: string;
      path?: string;
    }) => {
      try {
        const { sandboxId, path = '/' } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const fileSystem = await sandboxManager.getFileSystem(sandboxId, path);

        socket.emit('filesystem_data', {
          success: true,
          sandboxId,
          path,
          fileSystem
        });

      } catch (error) {
        logger.error('Error getting file system:', error);
        socket.emit('filesystem_error', {
          error: 'Failed to get file system',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle project status requests
    socket.on('get_project_status', (data: { projectId: string }) => {
      try {
        const { projectId } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const status = orchestrator.getSystemStatus(projectId);

        socket.emit('project_status', {
          success: true,
          projectId,
          status
        });

      } catch (error) {
        logger.error('Error getting project status:', error);
        socket.emit('project_error', {
          error: 'Failed to get project status'
        });
      }
    });

    // Handle real-time collaboration events
    socket.on('cursor_position', (data: {
      projectId: string;
      file: string;
      position: { line: number; column: number };
      userId: string;
    }) => {
      // Broadcast cursor position to other users in the project
      socket.to(`project:${data.projectId}`).emit('user_cursor', {
        ...data,
        socketId: socket.id,
        timestamp: new Date()
      });
    });

    socket.on('user_selection', (data: {
      projectId: string;
      file: string;
      selection: { start: any; end: any };
      userId: string;
    }) => {
      // Broadcast selection to other users in the project
      socket.to(`project:${data.projectId}`).emit('user_selection', {
        ...data,
        socketId: socket.id,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Notify project room about user leaving
      if (socket.projectId) {
        socket.to(`project:${socket.projectId}`).emit('user_left', {
          userId: socket.userId,
          socketId: socket.id,
          timestamp: new Date()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
      socket.emit('error_response', {
        message: 'An error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    });
  });

  // Global error handler
  io.engine.on('connection_error', (err) => {
    logger.error('Socket.IO connection error:', err);
  });

  logger.info('Socket.IO handlers initialized');
}