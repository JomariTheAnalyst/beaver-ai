import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';

export enum AgentType {
  PLANNER = 'planner',
  MAIN = 'main',
  UI_UX = 'ui_ux',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATA_LOGIC = 'data_logic',
  TESTING = 'testing',
  OPTIMIZATION = 'optimization',
  DEPLOYMENT = 'deployment'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface AgentMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  agentType?: string;
  metadata?: any;
  timestamp: Date;
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  input: any;
  priority: number;
  dependencies?: string[];
  assignedAgent?: AgentType;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  output?: any;
  error?: string;
  artifacts?: string[];
  nextTasks?: AgentTask[];
  completedAt: Date;
}

export interface AgentResponse {
  agentType: AgentType;
  message: AgentMessage;
  tasks?: AgentTask[];
  status: 'thinking' | 'working' | 'completed' | 'error';
  metadata?: any;
}

export abstract class Agent {
  protected agentId: string;
  protected agentType: AgentType;
  protected capabilities: string[];
  protected isActive: boolean;
  protected currentTask?: AgentTask;

  constructor(agentType: AgentType, capabilities: string[] = []) {
    this.agentId = uuidv4();
    this.agentType = agentType;
    this.capabilities = capabilities;
    this.isActive = false;
  }

  // Abstract methods that must be implemented by specific agents
  abstract processMessage(message: AgentMessage, context?: any): Promise<AgentResponse>;
  abstract executeTask(task: AgentTask, context?: any): Promise<TaskResult>;
  abstract getCapabilities(): string[];

  // Common methods
  public getAgentInfo() {
    return {
      id: this.agentId,
      type: this.agentType,
      capabilities: this.capabilities,
      isActive: this.isActive,
      currentTask: this.currentTask
    };
  }

  public activate(): void {
    this.isActive = true;
    logger.info(`Agent ${this.agentType} activated`);
  }

  public deactivate(): void {
    this.isActive = false;
    this.currentTask = undefined;
    logger.info(`Agent ${this.agentType} deactivated`);
  }

  protected createMessage(content: string, role: 'user' | 'assistant' | 'system' = 'assistant'): AgentMessage {
    return {
      id: uuidv4(),
      content,
      role,
      agentType: this.agentType,
      timestamp: new Date()
    };
  }

  protected createTask(
    type: string,
    description: string,
    input: any,
    priority: number = 1
  ): AgentTask {
    return {
      id: uuidv4(),
      type,
      description,
      input,
      priority,
      assignedAgent: this.agentType,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  protected logActivity(action: string, input?: any, output?: any, error?: string): void {
    logger.info(`Agent ${this.agentType} - ${action}`, {
      agentId: this.agentId,
      action,
      input,
      output,
      error,
      timestamp: new Date().toISOString()
    });
  }

  // Communication with other agents
  protected async communicateWithAgent(
    targetAgentType: AgentType,
    message: AgentMessage,
    context?: any
  ): Promise<AgentResponse> {
    // This will be implemented in the AgentOrchestrator
    throw new Error('Communication must be handled through AgentOrchestrator');
  }

  // Validate task compatibility
  protected validateTask(task: AgentTask): boolean {
    return this.capabilities.some(capability => 
      task.type.toLowerCase().includes(capability.toLowerCase())
    );
  }

  // Generate a response with streaming support
  protected createResponse(
    content: string,
    status: 'thinking' | 'working' | 'completed' | 'error' = 'completed',
    tasks?: AgentTask[],
    metadata?: any
  ): AgentResponse {
    return {
      agentType: this.agentType,
      message: this.createMessage(content),
      tasks,
      status,
      metadata
    };
  }
}