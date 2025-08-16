import axios from 'axios';
import { logger } from '../utils/logger';

interface E2BConfig {
  apiKey: string;
  baseUrl: string;
}

interface SandboxOptions {
  template?: string;
  metadata?: any;
  timeoutMs?: number;
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileSystemNode[];
}

export class SandboxManager {
  private config: E2BConfig;
  private activeSandboxes: Map<string, any>;

  constructor() {
    this.config = {
      apiKey: process.env.E2B_API_KEY || '',
      baseUrl: 'https://api.e2b.dev'
    };
    this.activeSandboxes = new Map();
  }

  async createSandbox(projectId: string, options: SandboxOptions = {}): Promise<any> {
    try {
      logger.info(`Creating sandbox for project: ${projectId}`);

      const response = await axios.post(
        `${this.config.baseUrl}/sandboxes`,
        {
          template: options.template || 'node',
          metadata: {
            projectId,
            ...options.metadata
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: options.timeoutMs || 30000
        }
      );

      const sandbox = {
        id: `sandbox_${projectId}`,
        e2bId: response.data.sandboxId || `e2b_${Date.now()}`,
        status: 'active',
        previewUrl: `https://sandbox-${projectId}.e2b.dev`,
        createdAt: new Date(),
        projectId
      };

      this.activeSandboxes.set(sandbox.id, sandbox);

      // Initialize the sandbox with basic setup
      await this.initializeSandbox(sandbox.e2bId);

      logger.info(`Sandbox created successfully: ${sandbox.id}`);
      return sandbox;

    } catch (error) {
      logger.error('Failed to create sandbox:', error);
      
      // Fallback - create a mock sandbox for development
      const mockSandbox = {
        id: `sandbox_${projectId}`,
        e2bId: `mock_${Date.now()}`,
        status: 'active',
        previewUrl: `http://localhost:3000`,
        createdAt: new Date(),
        projectId,
        mock: true
      };

      this.activeSandboxes.set(mockSandbox.id, mockSandbox);
      return mockSandbox;
    }
  }

  async executeCommand(sandboxId: string, command: string): Promise<CommandResult> {
    try {
      const sandbox = this.getSandboxByE2BId(sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${sandboxId}`);
      }

      if (sandbox.mock) {
        // Mock command execution for development
        return this.mockCommandExecution(command);
      }

      const response = await axios.post(
        `${this.config.baseUrl}/sandboxes/${sandboxId}/commands`,
        { command },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result: CommandResult = {
        stdout: response.data.stdout || '',
        stderr: response.data.stderr || '',
        exitCode: response.data.exitCode || 0,
        success: response.data.exitCode === 0
      };

      logger.info(`Command executed in sandbox ${sandboxId}:`, { command, result });
      return result;

    } catch (error) {
      logger.error(`Command execution failed in sandbox ${sandboxId}:`, error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        success: false
      };
    }
  }

  async writeFile(sandboxId: string, path: string, content: string): Promise<boolean> {
    try {
      const sandbox = this.getSandboxByE2BId(sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${sandboxId}`);
      }

      if (sandbox.mock) {
        logger.info(`Mock: Writing file ${path} in sandbox ${sandboxId}`);
        return true;
      }

      await axios.post(
        `${this.config.baseUrl}/sandboxes/${sandboxId}/filesystem/write`,
        {
          path,
          content
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`File written successfully: ${path} in sandbox ${sandboxId}`);
      return true;

    } catch (error) {
      logger.error(`Failed to write file ${path} in sandbox ${sandboxId}:`, error);
      return false;
    }
  }

  async readFile(sandboxId: string, path: string): Promise<string | null> {
    try {
      const sandbox = this.getSandboxByE2BId(sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${sandboxId}`);
      }

      if (sandbox.mock) {
        return `// Mock content for ${path}\nexport default function() {\n  return <div>Hello World</div>\n}`;
      }

      const response = await axios.get(
        `${this.config.baseUrl}/sandboxes/${sandboxId}/filesystem/read`,
        {
          params: { path },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.content || null;

    } catch (error) {
      logger.error(`Failed to read file ${path} from sandbox ${sandboxId}:`, error);
      return null;
    }
  }

  async getFileSystem(sandboxId: string, path: string = '/'): Promise<FileSystemNode[]> {
    try {
      const sandbox = this.getSandboxByE2BId(sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${sandboxId}`);
      }

      if (sandbox.mock) {
        return this.getMockFileSystem();
      }

      const response = await axios.get(
        `${this.config.baseUrl}/sandboxes/${sandboxId}/filesystem/list`,
        {
          params: { path, recursive: true },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.files || [];

    } catch (error) {
      logger.error(`Failed to get file system for sandbox ${sandboxId}:`, error);
      return [];
    }
  }

  async createProjectStructure(sandboxId: string, blueprint: any): Promise<boolean> {
    try {
      const commands = this.generateProjectSetupCommands(blueprint);
      
      for (const command of commands) {
        const result = await this.executeCommand(sandboxId, command);
        if (!result.success) {
          logger.warn(`Command failed but continuing: ${command}`, result);
        }
      }

      // Create initial files
      const initialFiles = this.generateInitialFiles(blueprint);
      for (const file of initialFiles) {
        await this.writeFile(sandboxId, file.path, file.content);
      }

      return true;

    } catch (error) {
      logger.error('Failed to create project structure:', error);
      return false;
    }
  }

  async installDependencies(sandboxId: string, architecture: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Install frontend dependencies
      const frontendInstall = await this.executeCommand(sandboxId, 'cd client && npm install');
      if (!frontendInstall.success) {
        return { success: false, error: frontendInstall.stderr };
      }

      // Install backend dependencies
      const backendInstall = await this.executeCommand(sandboxId, 'cd server && npm install');
      if (!backendInstall.success) {
        return { success: false, error: backendInstall.stderr };
      }

      // Generate Prisma client
      const prismaGenerate = await this.executeCommand(sandboxId, 'cd server && npx prisma generate');
      
      return { success: true };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteSandbox(sandboxId: string): Promise<boolean> {
    try {
      const sandbox = this.getSandboxByE2BId(sandboxId);
      if (!sandbox) return true;

      if (!sandbox.mock) {
        await axios.delete(
          `${this.config.baseUrl}/sandboxes/${sandboxId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`
            }
          }
        );
      }

      this.activeSandboxes.delete(sandbox.id);
      logger.info(`Sandbox deleted: ${sandboxId}`);
      return true;

    } catch (error) {
      logger.error(`Failed to delete sandbox ${sandboxId}:`, error);
      return false;
    }
  }

  private async initializeSandbox(sandboxId: string): Promise<void> {
    // Basic initialization commands
    const initCommands = [
      'mkdir -p /workspace',
      'cd /workspace',
      'git init'
    ];

    for (const command of initCommands) {
      await this.executeCommand(sandboxId, command);
    }
  }

  private getSandboxByE2BId(e2bId: string): any | null {
    for (const sandbox of this.activeSandboxes.values()) {
      if (sandbox.e2bId === e2bId) {
        return sandbox;
      }
    }
    return null;
  }

  private mockCommandExecution(command: string): CommandResult {
    // Mock different command outputs
    if (command.includes('npm install')) {
      return {
        stdout: 'Dependencies installed successfully',
        stderr: '',
        exitCode: 0,
        success: true
      };
    }

    if (command.includes('prisma generate')) {
      return {
        stdout: 'Prisma client generated',
        stderr: '',
        exitCode: 0,
        success: true
      };
    }

    return {
      stdout: `Executed: ${command}`,
      stderr: '',
      exitCode: 0,
      success: true
    };
  }

  private getMockFileSystem(): FileSystemNode[] {
    return [
      {
        name: 'client',
        path: '/workspace/client',
        type: 'directory',
        children: [
          { name: 'package.json', path: '/workspace/client/package.json', type: 'file', size: 1024 },
          { name: 'next.config.js', path: '/workspace/client/next.config.js', type: 'file', size: 512 },
          {
            name: 'src',
            path: '/workspace/client/src',
            type: 'directory',
            children: [
              { name: 'app', path: '/workspace/client/src/app', type: 'directory' },
              { name: 'components', path: '/workspace/client/src/components', type: 'directory' }
            ]
          }
        ]
      },
      {
        name: 'server',
        path: '/workspace/server',
        type: 'directory',
        children: [
          { name: 'package.json', path: '/workspace/server/package.json', type: 'file', size: 2048 },
          { name: 'tsconfig.json', path: '/workspace/server/tsconfig.json', type: 'file', size: 512 },
          {
            name: 'src',
            path: '/workspace/server/src',
            type: 'directory',
            children: [
              { name: 'index.ts', path: '/workspace/server/src/index.ts', type: 'file', size: 1024 }
            ]
          }
        ]
      }
    ];
  }

  private generateProjectSetupCommands(blueprint: any): string[] {
    return [
      'mkdir -p client server',
      'cd client && npm init -y',
      'cd server && npm init -y'
    ];
  }

  private generateInitialFiles(blueprint: any): { path: string; content: string }[] {
    return [
      {
        path: '/workspace/package.json',
        content: JSON.stringify({
          name: blueprint.requirements.projectName.toLowerCase().replace(/\s+/g, '-'),
          scripts: {
            dev: 'concurrently "npm run dev:server" "npm run dev:client"'
          }
        }, null, 2)
      },
      {
        path: '/workspace/README.md',
        content: `# ${blueprint.requirements.projectName}\n\n${blueprint.requirements.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm run dev\n\`\`\``
      }
    ];
  }
}