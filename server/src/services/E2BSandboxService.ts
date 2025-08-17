import axios from 'axios';

interface E2BConfig {
  apiKey: string;
  baseUrl?: string;
}

interface SandboxInfo {
  id: string;
  status: 'creating' | 'active' | 'stopped' | 'error';
  url?: string;
  metadata?: any;
}

interface FileOperation {
  path: string;
  content?: string;
  operation: 'create' | 'update' | 'delete' | 'read';
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export class E2BSandboxService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: E2BConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.e2b.dev';
  }

  async createSandbox(templateId: string = 'node'): Promise<SandboxInfo> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sandboxes`,
        {
          templateId,
          metadata: {
            createdBy: 'beaver-ai',
            timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.sandboxId,
        status: 'creating',
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Error creating sandbox:', error);
      throw new Error('Failed to create sandbox');
    }
  }

  async getSandboxStatus(sandboxId: string): Promise<SandboxInfo> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/sandboxes/${sandboxId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        id: sandboxId,
        status: response.data.status,
        url: response.data.url,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Error getting sandbox status:', error);
      throw new Error('Failed to get sandbox status');
    }
  }

  async executeCommand(sandboxId: string, command: string): Promise<CommandResult> {
    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.baseUrl}/sandboxes/${sandboxId}/commands`,
        {
          command,
          timeout: 30000 // 30 seconds timeout
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const duration = Date.now() - startTime;

      return {
        stdout: response.data.stdout || '',
        stderr: response.data.stderr || '',
        exitCode: response.data.exitCode || 0,
        duration
      };
    } catch (error) {
      console.error('Error executing command:', error);
      throw new Error('Failed to execute command');
    }
  }

  async writeFile(sandboxId: string, path: string, content: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/sandboxes/${sandboxId}/filesystem`,
        {
          path,
          content,
          operation: 'write'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to write file');
    }
  }

  async readFile(sandboxId: string, path: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/sandboxes/${sandboxId}/filesystem/${encodeURIComponent(path)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.content || '';
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file');
    }
  }

  async listFiles(sandboxId: string, path: string = '/'): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/sandboxes/${sandboxId}/filesystem`,
        {
          params: { path },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  async startDevServer(sandboxId: string, projectType: string = 'react'): Promise<string> {
    try {
      // Install dependencies first
      await this.executeCommand(sandboxId, 'npm install');
      
      // Start development server based on project type
      let startCommand = 'npm run dev';
      if (projectType === 'next') {
        startCommand = 'npm run dev';
      } else if (projectType === 'vite') {
        startCommand = 'npm run dev';
      } else if (projectType === 'node') {
        startCommand = 'npm start';
      }

      // Start the server in background
      await this.executeCommand(sandboxId, `${startCommand} &`);
      
      // Wait a moment for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the sandbox info to retrieve the URL
      const sandboxInfo = await this.getSandboxStatus(sandboxId);
      
      return sandboxInfo.url || `https://${sandboxId}.e2b.dev`;
    } catch (error) {
      console.error('Error starting dev server:', error);
      throw new Error('Failed to start development server');
    }
  }

  async stopSandbox(sandboxId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/sandboxes/${sandboxId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
    } catch (error) {
      console.error('Error stopping sandbox:', error);
      throw new Error('Failed to stop sandbox');
    }
  }

  async initializeProject(sandboxId: string, projectTemplate: any): Promise<void> {
    try {
      // Create package.json based on tech stack
      const packageJson = this.generatePackageJson(projectTemplate);
      await this.writeFile(sandboxId, 'package.json', JSON.stringify(packageJson, null, 2));

      // Create basic project structure
      if (projectTemplate.techStack.includes('React') || projectTemplate.techStack.includes('Next.js')) {
        await this.initializeReactProject(sandboxId, projectTemplate);
      } else if (projectTemplate.techStack.includes('Node.js')) {
        await this.initializeNodeProject(sandboxId, projectTemplate);
      }

      // Install dependencies
      await this.executeCommand(sandboxId, 'npm install');
      
      console.log(`Project initialized for sandbox ${sandboxId}`);
    } catch (error) {
      console.error('Error initializing project:', error);
      throw new Error('Failed to initialize project');
    }
  }

  private generatePackageJson(projectTemplate: any): any {
    const basePackage = {
      name: projectTemplate.title.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: projectTemplate.description,
      scripts: {},
      dependencies: {},
      devDependencies: {}
    };

    // Add dependencies based on tech stack
    if (projectTemplate.techStack.includes('React')) {
      basePackage.dependencies['react'] = '^18.0.0';
      basePackage.dependencies['react-dom'] = '^18.0.0';
    }

    if (projectTemplate.techStack.includes('Next.js')) {
      basePackage.dependencies['next'] = '^14.0.0';
      basePackage.scripts['dev'] = 'next dev';
      basePackage.scripts['build'] = 'next build';
      basePackage.scripts['start'] = 'next start';
    }

    if (projectTemplate.techStack.includes('TypeScript')) {
      basePackage.devDependencies['typescript'] = '^5.0.0';
      basePackage.devDependencies['@types/react'] = '^18.0.0';
      basePackage.devDependencies['@types/node'] = '^20.0.0';
    }

    if (projectTemplate.techStack.includes('TailwindCSS')) {
      basePackage.dependencies['tailwindcss'] = '^3.0.0';
      basePackage.dependencies['autoprefixer'] = '^10.0.0';
      basePackage.dependencies['postcss'] = '^8.0.0';
    }

    return basePackage;
  }

  private async initializeReactProject(sandboxId: string, projectTemplate: any): Promise<void> {
    // Create basic React structure
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectTemplate.title}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

    await this.writeFile(sandboxId, 'public/index.html', indexHtml);

    // Create basic App component
    const appComponent = `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${projectTemplate.title}
        </h1>
        <p className="text-lg text-gray-600">
          ${projectTemplate.description}
        </p>
      </div>
    </div>
  );
}

export default App;`;

    await this.writeFile(sandboxId, 'src/App.js', appComponent);
  }

  private async initializeNodeProject(sandboxId: string, projectTemplate: any): Promise<void> {
    // Create basic server file
    const serverCode = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${projectTemplate.title}',
    description: '${projectTemplate.description}'
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

    await this.writeFile(sandboxId, 'server.js', serverCode);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('E2B connection test failed:', error);
      return false;
    }
  }
}

export default E2BSandboxService;