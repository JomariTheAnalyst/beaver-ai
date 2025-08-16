import { Agent, AgentType, AgentMessage, AgentTask, TaskResult, AgentResponse, TaskStatus } from './base/Agent';
import { logger } from '../utils/logger';

interface ProjectRequirements {
  projectName: string;
  description: string;
  targetAudience: string;
  features: string[];
  technicalRequirements: string[];
  constraints: string[];
  timeline?: string;
  budget?: string;
}

interface ProjectBlueprint {
  requirements: ProjectRequirements;
  architecture: {
    frontend: string[];
    backend: string[];
    database: string[];
    integrations: string[];
  };
  phases: {
    name: string;
    tasks: string[];
    estimatedTime: string;
    dependencies: string[];
  }[];
  risks: string[];
  recommendations: string[];
}

export class PlannerAgent extends Agent {
  private conversationHistory: AgentMessage[];
  private currentRequirements?: Partial<ProjectRequirements>;

  constructor() {
    super(AgentType.PLANNER, [
      'requirement_gathering',
      'project_planning',
      'user_interaction',
      'clarification',
      'blueprint_creation'
    ]);
    this.conversationHistory = [];
  }

  async processMessage(message: AgentMessage, context?: any): Promise<AgentResponse> {
    this.conversationHistory.push(message);
    this.logActivity('Processing user message', { message: message.content });

    try {
      // Determine the stage of conversation
      const stage = this.determineConversationStage();
      
      switch (stage) {
        case 'initial':
          return await this.handleInitialRequirement(message);
        case 'clarification':
          return await this.handleClarification(message);
        case 'refinement':
          return await this.handleRequirementRefinement(message);
        case 'blueprint':
          return await this.generateBlueprint();
        default:
          return this.createResponse("I'm here to help you plan your project. What would you like to build?");
      }
    } catch (error) {
      this.logActivity('Error processing message', { message: message.content }, undefined, error as string);
      return this.createResponse(
        "I encountered an error while processing your request. Could you please try again?",
        'error'
      );
    }
  }

  async executeTask(task: AgentTask, context?: any): Promise<TaskResult> {
    this.currentTask = task;
    task.status = TaskStatus.RUNNING;

    try {
      switch (task.type) {
        case 'gather_requirements':
          return await this.gatherRequirements(task.input);
        case 'create_blueprint':
          return await this.createProjectBlueprint(task.input);
        case 'validate_requirements':
          return await this.validateRequirements(task.input);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
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

  private determineConversationStage(): string {
    if (this.conversationHistory.length <= 1) {
      return 'initial';
    }

    if (!this.currentRequirements?.projectName) {
      return 'initial';
    }

    if (!this.currentRequirements?.features || this.currentRequirements.features.length === 0) {
      return 'clarification';
    }

    if (!this.currentRequirements?.technicalRequirements) {
      return 'refinement';
    }

    return 'blueprint';
  }

  private async handleInitialRequirement(message: AgentMessage): Promise<AgentResponse> {
    const content = message.content.toLowerCase();
    
    // Extract project intent
    this.currentRequirements = {
      projectName: this.extractProjectName(content),
      description: message.content,
      features: this.extractFeatures(content),
      technicalRequirements: [],
      constraints: []
    };

    const clarifyingQuestions = this.generateClarifyingQuestions();
    
    return this.createResponse(
      `Great! I understand you want to build: **${this.currentRequirements.projectName || 'a web application'}**

Let me ask a few questions to better understand your vision:

${clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Please answer these questions so I can create a comprehensive plan for your project.`,
      'thinking'
    );
  }

  private async handleClarification(message: AgentMessage): Promise<AgentResponse> {
    // Process answers to clarifying questions
    this.updateRequirementsFromAnswers(message.content);

    if (this.needsMoreClarification()) {
      const additionalQuestions = this.generateAdditionalQuestions();
      return this.createResponse(
        `Thank you for the information! I have a few more questions to ensure I understand everything correctly:

${additionalQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
        'thinking'
      );
    }

    return await this.handleRequirementRefinement(message);
  }

  private async handleRequirementRefinement(message: AgentMessage): Promise<AgentResponse> {
    // Refine technical requirements
    this.updateTechnicalRequirements();

    return this.createResponse(
      `Perfect! I now have a clear understanding of your project. Here's what I've gathered:

**Project**: ${this.currentRequirements?.projectName}
**Description**: ${this.currentRequirements?.description}
**Key Features**: ${this.currentRequirements?.features?.join(', ')}

Now I'll create a comprehensive blueprint for your project. This includes:
- Architecture recommendations
- Development phases
- Timeline estimates
- Potential risks and solutions

Would you like me to proceed with generating the blueprint?`,
      'working'
    );
  }

  private async generateBlueprint(): Promise<AgentResponse> {
    const blueprint = this.createDetailedBlueprint();
    
    const blueprintTask = this.createTask(
      'create_project_structure',
      'Create initial project structure and setup',
      { blueprint, requirements: this.currentRequirements },
      1
    );

    return this.createResponse(
      `🎉 **Project Blueprint Ready!**

## ${blueprint.requirements.projectName}

### Architecture Overview
- **Frontend**: ${blueprint.architecture.frontend.join(', ')}
- **Backend**: ${blueprint.architecture.backend.join(', ')}
- **Database**: ${blueprint.architecture.database.join(', ')}
- **Integrations**: ${blueprint.architecture.integrations.join(', ')}

### Development Phases
${blueprint.phases.map((phase, i) => `
**Phase ${i + 1}: ${phase.name}** (${phase.estimatedTime})
${phase.tasks.map(task => `- ${task}`).join('\n')}
`).join('\n')}

### Risk Assessment
${blueprint.risks.map(risk => `⚠️ ${risk}`).join('\n')}

### Recommendations
${blueprint.recommendations.map(rec => `✅ ${rec}`).join('\n')}

Ready to start building? I'll hand this over to the Main Agent to begin development!`,
      'completed',
      [blueprintTask],
      { blueprint }
    );
  }

  private extractProjectName(content: string): string {
    // Simple extraction logic - can be enhanced with NLP
    const patterns = [
      /(?:build|create|make|develop)\s+(?:a\s+)?(?:web\s+)?(?:app|application|site|platform|tool)\s+(?:for\s+|called\s+|named\s+)?([^.!?]+)/i,
      /(?:I\s+want|I'd\s+like|I\s+need)\s+(?:to\s+)?(?:build|create|make|develop)\s+([^.!?]+)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Web Application';
  }

  private extractFeatures(content: string): string[] {
    const featureKeywords = [
      'authentication', 'login', 'register', 'user management',
      'dashboard', 'chat', 'messaging', 'real-time',
      'database', 'storage', 'file upload', 'search',
      'payment', 'billing', 'subscription', 'e-commerce',
      'admin', 'analytics', 'reporting', 'notifications',
      'mobile', 'responsive', 'API', 'integration'
    ];

    const features: string[] = [];
    const lowerContent = content.toLowerCase();

    featureKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        features.push(keyword);
      }
    });

    return features;
  }

  private generateClarifyingQuestions(): string[] {
    const questions = [
      "Who is your target audience and what problem does this solve?",
      "What are the main features you want users to be able to do?",
      "Do you have any specific design preferences or examples you like?",
      "Are there any integrations with external services you need?",
      "What's your expected timeline and any budget constraints?"
    ];

    return questions;
  }

  private updateRequirementsFromAnswers(answers: string): void {
    // This would use NLP to parse answers and update requirements
    // For now, we'll do basic keyword extraction
    if (this.currentRequirements) {
      const lowerAnswers = answers.toLowerCase();
      
      // Extract additional features from answers
      const additionalFeatures = this.extractFeatures(answers);
      this.currentRequirements.features = [
        ...(this.currentRequirements.features || []),
        ...additionalFeatures
      ];

      // Extract target audience
      if (lowerAnswers.includes('business') || lowerAnswers.includes('company')) {
        this.currentRequirements.targetAudience = 'business users';
      } else if (lowerAnswers.includes('consumer') || lowerAnswers.includes('general')) {
        this.currentRequirements.targetAudience = 'general consumers';
      }
    }
  }

  private needsMoreClarification(): boolean {
    return !this.currentRequirements?.targetAudience || 
           !this.currentRequirements?.features || 
           this.currentRequirements.features.length < 2;
  }

  private generateAdditionalQuestions(): string[] {
    const questions: string[] = [];

    if (!this.currentRequirements?.targetAudience) {
      questions.push("Who will be using this application primarily?");
    }

    if (!this.currentRequirements?.features || this.currentRequirements.features.length < 2) {
      questions.push("What specific actions should users be able to perform?");
    }

    return questions;
  }

  private updateTechnicalRequirements(): void {
    if (this.currentRequirements) {
      this.currentRequirements.technicalRequirements = [
        'Next.js with TypeScript',
        'Express.js backend',
        'PostgreSQL database',
        'TailwindCSS styling',
        'shadcn/ui components',
        'Real-time WebSocket communication'
      ];

      // Add specific requirements based on features
      if (this.currentRequirements.features?.includes('authentication')) {
        this.currentRequirements.technicalRequirements.push('Clerk authentication');
      }

      if (this.currentRequirements.features?.some(f => f.includes('chat') || f.includes('messaging'))) {
        this.currentRequirements.technicalRequirements.push('Socket.io for real-time messaging');
      }
    }
  }

  private createDetailedBlueprint(): ProjectBlueprint {
    if (!this.currentRequirements) {
      throw new Error('Requirements not defined');
    }

    return {
      requirements: this.currentRequirements as ProjectRequirements,
      architecture: {
        frontend: ['Next.js 14', 'TypeScript', 'TailwindCSS', 'shadcn/ui', 'Framer Motion'],
        backend: ['Express.js', 'TypeScript', 'Socket.io', 'Prisma ORM'],
        database: ['PostgreSQL'],
        integrations: ['Clerk Auth', 'E2B Sandbox']
      },
      phases: [
        {
          name: 'Foundation Setup',
          tasks: [
            'Initialize Next.js and Express.js applications',
            'Setup database schema and Prisma',
            'Configure authentication with Clerk',
            'Setup basic UI components with shadcn/ui'
          ],
          estimatedTime: '2-3 days',
          dependencies: []
        },
        {
          name: 'Core Features',
          tasks: [
            'Implement user authentication flow',
            'Build main dashboard and navigation',
            'Create core feature components',
            'Setup real-time communication'
          ],
          estimatedTime: '1-2 weeks',
          dependencies: ['Foundation Setup']
        },
        {
          name: 'Advanced Features',
          tasks: [
            'Add advanced functionality',
            'Implement integrations',
            'Add animations and interactions',
            'Optimize performance'
          ],
          estimatedTime: '1-2 weeks',
          dependencies: ['Core Features']
        },
        {
          name: 'Polish & Deploy',
          tasks: [
            'Testing and bug fixes',
            'UI/UX refinements',
            'Security hardening',
            'Production deployment'
          ],
          estimatedTime: '3-5 days',
          dependencies: ['Advanced Features']
        }
      ],
      risks: [
        'Complex real-time features may require additional optimization',
        'Third-party integrations might have rate limits or API changes',
        'Database performance may need optimization for large datasets'
      ],
      recommendations: [
        'Start with core features and iterate based on user feedback',
        'Implement proper error handling and loading states',
        'Use TypeScript throughout for better code quality',
        'Plan for scalability from the beginning'
      ]
    };
  }

  private async gatherRequirements(input: any): Promise<TaskResult> {
    // Implementation for gathering requirements task
    return {
      taskId: this.currentTask!.id,
      status: TaskStatus.COMPLETED,
      output: this.currentRequirements,
      completedAt: new Date()
    };
  }

  private async createProjectBlueprint(input: any): Promise<TaskResult> {
    const blueprint = this.createDetailedBlueprint();
    
    return {
      taskId: this.currentTask!.id,
      status: TaskStatus.COMPLETED,
      output: blueprint,
      artifacts: ['project-blueprint.json'],
      completedAt: new Date()
    };
  }

  private async validateRequirements(input: any): Promise<TaskResult> {
    const isValid = this.currentRequirements && 
                   this.currentRequirements.projectName && 
                   this.currentRequirements.features &&
                   this.currentRequirements.features.length > 0;

    return {
      taskId: this.currentTask!.id,
      status: isValid ? TaskStatus.COMPLETED : TaskStatus.FAILED,
      output: { valid: isValid, requirements: this.currentRequirements },
      error: isValid ? undefined : 'Requirements incomplete',
      completedAt: new Date()
    };
  }
}