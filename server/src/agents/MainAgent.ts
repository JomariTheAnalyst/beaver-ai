import { Agent, AgentType, AgentMessage, AgentTask, TaskResult, AgentResponse, TaskStatus } from './base/Agent';
import { SandboxManager } from '../services/SandboxManager';
import { logger } from '../utils/logger';

interface ProjectContext {
  projectId: string;
  userId: string;
  blueprint?: any;
  requirements?: any;
  currentPhase: string;
  activeTasks: Map<string, AgentTask>;
  completedTasks: AgentTask[];
  sandbox?: {
    id: string;
    e2bId: string;
    previewUrl?: string;
  };
}

export class MainAgent extends Agent {
  private specializedAgents: Map<AgentType, Agent>;
  private projects: Map<string, ProjectContext>;
  private sandboxManager: SandboxManager;

  constructor(sandboxManager: SandboxManager) {
    super(AgentType.MAIN, [
      'orchestration',
      'task_management',
      'project_coordination',
      'agent_communication',
      'workflow_management'
    ]);
    
    this.specializedAgents = new Map();
    this.projects = new Map();
    this.sandboxManager = sandboxManager;
  }

  async processMessage(message: AgentMessage, context?: any): Promise<AgentResponse> {
    this.logActivity('Processing message from planner', { message: message.content });

    try {
      const projectContext = await this.getOrCreateProjectContext(context?.projectId, context?.userId);
      
      // Determine what action to take based on the message
      if (message.content.includes('blueprint') || message.metadata?.blueprint) {
        return await this.initializeProject(message, projectContext);
      } else if (message.content.includes('task') || message.metadata?.task) {
        return await this.handleTaskRequest(message, projectContext);
      } else {
        return await this.coordinateAgents(message, projectContext);
      }

    } catch (error) {
      this.logActivity('Error processing message', { message: message.content }, undefined, error as string);
      return this.createResponse(
        "I encountered an error while coordinating the project. Let me try a different approach.",
        'error'
      );
    }
  }

  async executeTask(task: AgentTask, context?: any): Promise<TaskResult> {
    this.currentTask = task;
    task.status = TaskStatus.RUNNING;

    try {
      switch (task.type) {
        case 'create_project_structure':
          return await this.createProjectStructure(task, context);
        case 'setup_sandbox':
          return await this.setupSandbox(task, context);
        case 'coordinate_development':
          return await this.coordinateDevelopment(task, context);
        case 'manage_workflow':
          return await this.manageWorkflow(task, context);
        default:
          return await this.delegateTask(task, context);
      }
    } catch (error) {
      return {
        taskId: task.id,
        status: TaskStatus.FAILED,
        error: error as string,
        completedAt: new Date()
      };
    }
  }

  getCapabilities(): string[] {
    return this.capabilities;
  }

  // Register specialized agents
  public registerAgent(agentType: AgentType, agent: Agent): void {
    this.specializedAgents.set(agentType, agent);
    logger.info(`Registered ${agentType} agent with Main Agent`);
  }

  private async getOrCreateProjectContext(projectId?: string, userId?: string): Promise<ProjectContext> {
    if (!projectId || !userId) {
      throw new Error('Project ID and User ID are required');
    }

    if (!this.projects.has(projectId)) {
      this.projects.set(projectId, {
        projectId,
        userId,
        currentPhase: 'initialization',
        activeTasks: new Map(),
        completedTasks: []
      });
    }

    return this.projects.get(projectId)!;
  }

  private async initializeProject(message: AgentMessage, context: ProjectContext): Promise<AgentResponse> {
    const blueprint = message.metadata?.blueprint;
    
    if (!blueprint) {
      throw new Error('No blueprint provided for project initialization');
    }

    context.blueprint = blueprint;
    context.requirements = blueprint.requirements;
    context.currentPhase = 'setup';

    // Create sandbox for the project
    const sandboxTask = this.createTask(
      'setup_sandbox',
      'Create and configure development sandbox',
      { projectId: context.projectId, blueprint },
      1
    );

    const structureTask = this.createTask(
      'create_project_structure',
      'Create initial project structure based on blueprint',
      { projectId: context.projectId, blueprint },
      2
    );

    context.activeTasks.set(sandboxTask.id, sandboxTask);
    context.activeTasks.set(structureTask.id, structureTask);

    // Execute sandbox creation immediately
    const sandboxResult = await this.executeTask(sandboxTask, context);
    
    if (sandboxResult.status === TaskStatus.COMPLETED) {
      context.sandbox = sandboxResult.output;
    }

    return this.createResponse(
      `🚀 **Project Initialization Started!**

I'm setting up your **${blueprint.requirements.projectName}** project with the following:

**Development Environment:**
- ✅ Secure sandbox created (ID: ${context.sandbox?.id || 'pending'})
- 🔄 Project structure generation in progress
- 📦 Installing dependencies: ${blueprint.architecture.frontend.join(', ')}

**Next Steps:**
1. Configure development environment
2. Setup database schema
3. Initialize authentication system
4. Create basic UI components

**Live Preview:** ${context.sandbox?.previewUrl || 'Will be available shortly'}

I'll coordinate with specialized agents to build each component. You can watch the progress in real-time!`,
      'working',
      [structureTask],
      { 
        projectContext: context,
        sandbox: context.sandbox,
        nextPhase: 'development'
      }
    );
  }

  private async handleTaskRequest(message: AgentMessage, context: ProjectContext): Promise<AgentResponse> {
    const taskType = this.extractTaskType(message.content);
    const priority = this.determinePriority(message.content);

    const task = this.createTask(
      taskType,
      message.content,
      { message: message.content, context },
      priority
    );

    const result = await this.delegateTask(task, context);

    return this.createResponse(
      `Task "${taskType}" has been ${result.status}. ${result.error || 'Processing continues...'}`,
      result.status === TaskStatus.COMPLETED ? 'completed' : 'working'
    );
  }

  private async coordinateAgents(message: AgentMessage, context: ProjectContext): Promise<AgentResponse> {
    // Analyze the current project phase and coordinate appropriate agents
    const currentPhase = this.determineCurrentPhase(context);
    const requiredAgents = this.getRequiredAgents(currentPhase, message.content);

    const tasks: AgentTask[] = [];
    for (const agentType of requiredAgents) {
      const task = this.createTask(
        `${agentType}_work`,
        `Handle ${agentType} aspects of: ${message.content}`,
        { message: message.content, phase: currentPhase },
        this.getAgentPriority(agentType)
      );
      
      tasks.push(task);
    }

    return this.createResponse(
      `I'm coordinating ${requiredAgents.length} specialized agents to handle your request:
      
${requiredAgents.map(agent => `🤖 **${agent.toUpperCase()} Agent**: Processing ${agent} requirements`).join('\n')}

This involves multiple steps that will be executed in parallel where possible. I'll keep you updated on the progress!`,
      'working',
      tasks,
      { coordinatedAgents: requiredAgents, phase: currentPhase }
    );
  }

  private async createProjectStructure(task: AgentTask, context: ProjectContext): Promise<TaskResult> {
    const { blueprint } = task.input;
    
    try {
      // Use sandbox to create project structure
      if (context.sandbox?.e2bId) {
        await this.sandboxManager.createProjectStructure(context.sandbox.e2bId, blueprint);
        
        // Install dependencies
        const installResult = await this.sandboxManager.installDependencies(
          context.sandbox.e2bId,
          blueprint.architecture
        );

        if (!installResult.success) {
          throw new Error(`Dependency installation failed: ${installResult.error}`);
        }
      }

      return {
        taskId: task.id,
        status: TaskStatus.COMPLETED,
        output: {
          structure: 'Project structure created successfully',
          dependencies: 'All dependencies installed',
          previewUrl: context.sandbox?.previewUrl
        },
        artifacts: ['package.json', 'tsconfig.json', 'tailwind.config.js'],
        completedAt: new Date()
      };

    } catch (error) {
      return {
        taskId: task.id,
        status: TaskStatus.FAILED,
        error: error as string,
        completedAt: new Date()
      };
    }
  }

  private async setupSandbox(task: AgentTask, context: ProjectContext): Promise<TaskResult> {
    const { projectId, blueprint } = task.input;

    try {
      const sandbox = await this.sandboxManager.createSandbox(projectId, {
        template: 'nextjs-typescript',
        metadata: { blueprint }
      });

      context.sandbox = {
        id: sandbox.id,
        e2bId: sandbox.e2bId,
        previewUrl: sandbox.previewUrl
      };

      return {
        taskId: task.id,
        status: TaskStatus.COMPLETED,
        output: context.sandbox,
        completedAt: new Date()
      };

    } catch (error) {
      return {
        taskId: task.id,
        status: TaskStatus.FAILED,
        error: error as string,
        completedAt: new Date()
      };
    }
  }

  private async coordinateDevelopment(task: AgentTask, context: ProjectContext): Promise<TaskResult> {
    // Coordinate the development phase with multiple agents
    const phase = context.currentPhase;
    const requiredWork = this.getPhaseTasks(phase);

    const results: any[] = [];
    
    for (const work of requiredWork) {
      const agent = this.specializedAgents.get(work.agentType);
      if (agent) {
        const workTask = this.createTask(work.type, work.description, work.input);
        const result = await agent.executeTask(workTask, context);
        results.push(result);
      }
    }

    const allSuccessful = results.every(r => r.status === TaskStatus.COMPLETED);

    return {
      taskId: task.id,
      status: allSuccessful ? TaskStatus.COMPLETED : TaskStatus.FAILED,
      output: results,
      completedAt: new Date()
    };
  }

  private async manageWorkflow(task: AgentTask, context: ProjectContext): Promise<TaskResult> {
    // Manage the overall workflow and phase transitions
    const currentTasks = Array.from(context.activeTasks.values());
    const completedTasks = currentTasks.filter(t => t.status === TaskStatus.COMPLETED);
    const failedTasks = currentTasks.filter(t => t.status === TaskStatus.FAILED);

    // Move completed tasks to completed list
    completedTasks.forEach(t => {
      context.completedTasks.push(t);
      context.activeTasks.delete(t.id);
    });

    // Determine if we can move to the next phase
    if (currentTasks.length === completedTasks.length + failedTasks.length) {
      const nextPhase = this.getNextPhase(context.currentPhase);
      if (nextPhase) {
        context.currentPhase = nextPhase;
      }
    }

    return {
      taskId: task.id,
      status: TaskStatus.COMPLETED,
      output: {
        currentPhase: context.currentPhase,
        completedTasks: completedTasks.length,
        activeTasks: context.activeTasks.size,
        failedTasks: failedTasks.length
      },
      completedAt: new Date()
    };
  }

  private async delegateTask(task: AgentTask, context: ProjectContext): Promise<TaskResult> {
    const agentType = this.determineAgentForTask(task);
    const agent = this.specializedAgents.get(agentType);

    if (!agent) {
      return {
        taskId: task.id,
        status: TaskStatus.FAILED,
        error: `No agent available for task type: ${task.type}`,
        completedAt: new Date()
      };
    }

    return await agent.executeTask(task, context);
  }

  // Helper methods
  private extractTaskType(content: string): string {
    // Analyze content to determine task type
    if (content.includes('UI') || content.includes('design')) return 'ui_design';
    if (content.includes('backend') || content.includes('API')) return 'backend_development';
    if (content.includes('frontend') || content.includes('component')) return 'frontend_development';
    if (content.includes('database') || content.includes('data')) return 'data_modeling';
    if (content.includes('test')) return 'testing';
    return 'general_development';
  }

  private determinePriority(content: string): number {
    if (content.includes('urgent') || content.includes('critical')) return 1;
    if (content.includes('important') || content.includes('priority')) return 2;
    return 3;
  }

  private determineCurrentPhase(context: ProjectContext): string {
    return context.currentPhase || 'planning';
  }

  private getRequiredAgents(phase: string, content: string): AgentType[] {
    const agents: AgentType[] = [];
    
    // Based on phase and content, determine which agents are needed
    if (phase.includes('setup') || phase.includes('init')) {
      agents.push(AgentType.BACKEND);
    }
    
    if (content.includes('UI') || content.includes('design') || content.includes('interface')) {
      agents.push(AgentType.UI_UX, AgentType.FRONTEND);
    }
    
    if (content.includes('API') || content.includes('backend') || content.includes('server')) {
      agents.push(AgentType.BACKEND);
    }
    
    if (content.includes('data') || content.includes('database')) {
      agents.push(AgentType.DATA_LOGIC);
    }

    return agents.length > 0 ? agents : [AgentType.FRONTEND];
  }

  private getAgentPriority(agentType: AgentType): number {
    const priorities: Record<string, number> = {
      [AgentType.PLANNER]: 1,
      [AgentType.MAIN]: 1,
      [AgentType.BACKEND]: 1,
      [AgentType.DATA_LOGIC]: 1,
      [AgentType.FRONTEND]: 2,
      [AgentType.UI_UX]: 2,
      [AgentType.TESTING]: 3,
      [AgentType.OPTIMIZATION]: 4,
      [AgentType.DEPLOYMENT]: 5
    };
    
    return priorities[agentType] || 3;
  }

  private determineAgentForTask(task: AgentTask): AgentType {
    const taskType = task.type.toLowerCase();
    
    if (taskType.includes('ui') || taskType.includes('design')) return AgentType.UI_UX;
    if (taskType.includes('frontend') || taskType.includes('component')) return AgentType.FRONTEND;
    if (taskType.includes('backend') || taskType.includes('api')) return AgentType.BACKEND;
    if (taskType.includes('data') || taskType.includes('database')) return AgentType.DATA_LOGIC;
    if (taskType.includes('test')) return AgentType.TESTING;
    if (taskType.includes('deploy')) return AgentType.DEPLOYMENT;
    
    return AgentType.FRONTEND; // Default
  }

  private getPhaseTasks(phase: string): any[] {
    // Define tasks for each phase
    switch (phase) {
      case 'setup':
        return [
          { agentType: AgentType.BACKEND, type: 'setup_server', description: 'Setup Express.js server', input: {} },
          { agentType: AgentType.DATA_LOGIC, type: 'setup_database', description: 'Setup database schema', input: {} }
        ];
      case 'development':
        return [
          { agentType: AgentType.FRONTEND, type: 'create_components', description: 'Create UI components', input: {} },
          { agentType: AgentType.BACKEND, type: 'create_apis', description: 'Create API endpoints', input: {} }
        ];
      default:
        return [];
    }
  }

  private getNextPhase(currentPhase: string): string | null {
    const phases = ['planning', 'setup', 'development', 'testing', 'deployment'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }
}