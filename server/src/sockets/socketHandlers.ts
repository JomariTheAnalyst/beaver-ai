import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import AIService from '../services/AIService';
import E2BSandboxService from '../services/E2BSandboxService';

interface Services {
  aiService: AIService;
  e2bService: E2BSandboxService;
  prisma: PrismaClient;
}

export function setupSocketHandlers(io: SocketIOServer, services: Services) {
  const { aiService, e2bService, prisma } = services;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📞 Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`📞 Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Join project room for real-time collaboration
    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`🚀 Socket ${socket.id} joined project: ${projectId}`);
    });

    // Leave project room
    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`🚀 Socket ${socket.id} left project: ${projectId}`);
    });

    // Handle real-time chat messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message, projectContext } = data;
        
        // Save user message to database
        const userMessage = await prisma.message.create({
          data: {
            conversationId,
            content: message.content,
            role: message.role,
            images: message.images ? JSON.stringify(message.images) : null,
          }
        });

        // Broadcast user message to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          id: userMessage.id,
          content: userMessage.content,
          role: userMessage.role,
          images: userMessage.images ? JSON.parse(userMessage.images) : null,
          timestamp: userMessage.createdAt
        });

        // Process with AI service
        const messages = [{ 
          role: message.role, 
          content: message.content, 
          images: message.images 
        }];
        
        const aiResponse = await aiService.processChatMessage(messages, projectContext);

        // Save AI response to database
        const aiMessage = await prisma.message.create({
          data: {
            conversationId,
            content: aiResponse.content,
            role: 'assistant',
            agentType: aiResponse.agentType,
            metadata: aiResponse.metadata ? JSON.stringify(aiResponse.metadata) : null,
          }
        });

        // Broadcast AI response to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          id: aiMessage.id,
          content: aiMessage.content,
          role: 'assistant',
          agentType: aiMessage.agentType,
          timestamp: aiMessage.createdAt
        });

      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    // Handle sandbox operations
    socket.on('sandbox_command', async (data) => {
      try {
        const { sandboxId, command, projectId } = data;
        
        // Execute command in sandbox
        const result = await e2bService.executeCommand(sandboxId, command);
        
        // Broadcast result to project room
        io.to(`project:${projectId}`).emit('command_result', {
          sandboxId,
          command,
          result,
          timestamp: new Date().toISOString()
        });

        // Log to database
        await prisma.sandboxLog.create({
          data: {
            sandboxId,
            type: 'COMMAND',
            message: command,
            level: 'INFO',
            metadata: JSON.stringify(result)
          }
        });

      } catch (error) {
        console.error('Error executing sandbox command:', error);
        socket.emit('error', { message: 'Failed to execute command' });
      }
    });

    // Handle file operations
    socket.on('file_update', async (data) => {
      try {
        const { sandboxId, projectId, path, content, operation } = data;
        
        if (operation === 'write') {
          await e2bService.writeFile(sandboxId, path, content);
          
          // Update project file in database
          await prisma.projectFile.upsert({
            where: {
              projectId_path: {
                projectId,
                path
              }
            },
            update: {
              content,
              size: content.length,
              updatedAt: new Date()
            },
            create: {
              projectId,
              path,
              content,
              size: content.length,
              mimeType: getMimeType(path)
            }
          });

          // Broadcast file change to project room
          io.to(`project:${projectId}`).emit('file_changed', {
            path,
            content,
            operation,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Error updating file:', error);
        socket.emit('error', { message: 'Failed to update file' });
      }
    });

    // Handle project creation
    socket.on('create_project', async (data) => {
      try {
        const { userId, template, name, description } = data;
        
        // Create project in database
        const project = await prisma.project.create({
          data: {
            userId,
            name: name || template.title,
            description: description || template.description,
            status: 'PLANNING',
            metadata: JSON.stringify(template)
          }
        });

        // Create sandbox for the project
        const sandbox = await e2bService.createSandbox();
        
        // Save sandbox info to database
        await prisma.sandbox.create({
          data: {
            projectId: project.id,
            e2bId: sandbox.id,
            status: 'CREATING',
            metadata: JSON.stringify(sandbox.metadata)
          }
        });

        // Initialize project in sandbox
        await e2bService.initializeProject(sandbox.id, template);

        // Update sandbox status
        await prisma.sandbox.update({
          where: { e2bId: sandbox.id },
          data: { status: 'ACTIVE' }
        });

        // Emit project created event
        socket.emit('project_created', {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status
          },
          sandbox: {
            id: sandbox.id,
            status: 'ACTIVE'
          }
        });

      } catch (error) {
        console.error('Error creating project:', error);
        socket.emit('error', { message: 'Failed to create project' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId, userId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', { userId });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId, userId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'application/javascript';
    case 'ts':
    case 'tsx':
      return 'application/typescript';
    case 'css':
      return 'text/css';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'md':
      return 'text/markdown';
    default:
      return 'text/plain';
  }
}

export { setupSocketHandlers };