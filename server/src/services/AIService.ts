import axios from 'axios';
import { logger } from '../utils/logger';

export interface AIResponse {
  content: string;
  agentType?: string;
  metadata?: any;
}

export interface ConversationContext {
  projectId?: string;
  conversationHistory: any[];
  userPreferences?: any;
  projectRequirements?: any;
}

export class AIService {
  private geminiApiKey: string;
  private openRouterApiKey: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async generatePlannerResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildPlannerSystemPrompt();
      const conversationHistory = this.formatConversationHistory(context.conversationHistory);
      
      const response = await this.callGeminiAPI({
        system: systemPrompt,
        history: conversationHistory,
        userMessage,
        agentType: 'planner'
      });

      return {
        content: response.content,
        agentType: 'planner',
        metadata: {
          model: 'gemini-pro',
          timestamp: new Date(),
          context: this.extractRequirementsFromResponse(response.content)
        }
      };

    } catch (error) {
      logger.error('Error generating planner response:', error);
      return this.getFallbackPlannerResponse(userMessage);
    }
  }

  async generateMainAgentResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildMainAgentSystemPrompt(context);
      
      const response = await this.callGeminiAPI({
        system: systemPrompt,
        history: context.conversationHistory,
        userMessage,
        agentType: 'main'
      });

      return {
        content: response.content,
        agentType: 'main',
        metadata: {
          model: 'gemini-pro',
          timestamp: new Date(),
          tasks: this.extractTasksFromResponse(response.content)
        }
      };

    } catch (error) {
      logger.error('Error generating main agent response:', error);
      return this.getFallbackMainAgentResponse(userMessage);
    }
  }

  async generateCodeWithOpenRouter(
    prompt: string,
    language: string = 'typescript',
    framework?: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are an expert ${language} developer${framework ? ` specializing in ${framework}` : ''}. 
Generate clean, production-ready code following best practices. Include proper types, error handling, and comments.`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content || '';

    } catch (error) {
      logger.error('Error generating code with OpenRouter:', error);
      return `// Code generation failed\n// Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async callGeminiAPI(params: {
    system: string;
    history: any[];
    userMessage: string;
    agentType: string;
  }): Promise<{ content: string }> {
    const { system, history, userMessage, agentType } = params;

    try {
      // Format messages for Gemini API
      const messages = [
        { role: 'user', parts: [{ text: system }] },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        {
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { content };

    } catch (error) {
      logger.error('Gemini API call failed:', error);
      throw error;
    }
  }

  private buildPlannerSystemPrompt(): string {
    return `You are an expert AI Planner Agent for Beaver AI, a revolutionary AI-native development platform.

Your role is to:
1. Gather comprehensive project requirements through natural conversation
2. Ask clarifying questions to understand user needs
3. Create detailed project blueprints
4. Validate requirements and ensure feasibility

Guidelines:
- Be friendly, professional, and enthusiastic about building great applications
- Ask specific, actionable questions
- Break down complex requirements into manageable components  
- Provide clear, structured responses with bullet points and sections
- Focus on modern web development with Next.js, TypeScript, and TailwindCSS
- Consider user experience, scalability, and best practices

Current capabilities:
- Next.js 14 with TypeScript
- TailwindCSS + shadcn/ui components
- Express.js backend with Prisma + PostgreSQL
- Clerk authentication
- Real-time features with Socket.io
- E2B sandbox environments

Always respond in a structured format with clear sections and actionable next steps.`;
  }

  private buildMainAgentSystemPrompt(context: ConversationContext): string {
    return `You are the Main Agent orchestrator for Beaver AI, coordinating specialized AI agents to build web applications.

Your role is to:
1. Coordinate development tasks across specialized agents
2. Manage project workflow and phases
3. Provide status updates and progress reports
4. Handle task delegation and monitoring

Current Project Context:
${context.projectRequirements ? `Requirements: ${JSON.stringify(context.projectRequirements, null, 2)}` : 'No requirements available yet'}

Available Specialized Agents:
- Frontend Agent: React/Next.js components, UI implementation
- Backend Agent: APIs, server logic, database operations  
- UI/UX Agent: Design systems, user experience optimization
- Testing Agent: Automated testing and quality assurance

Respond with clear progress updates, next steps, and coordinate agent activities effectively.`;
  }

  private formatConversationHistory(history: any[]): any[] {
    return history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  private extractRequirementsFromResponse(content: string): any {
    // Extract structured requirements from AI response
    const requirements: any = {};
    
    if (content.includes('Project:') || content.includes('**Project**')) {
      const projectMatch = content.match(/\*\*Project\*\*:?\s*([^\n]+)/i);
      if (projectMatch) requirements.projectName = projectMatch[1].trim();
    }

    if (content.includes('Features:') || content.includes('**Features**')) {
      const featuresMatch = content.match(/\*\*Features\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
      if (featuresMatch) {
        requirements.features = featuresMatch[1]
          .split(/[-•*\n]/)
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }
    }

    return requirements;
  }

  private extractTasksFromResponse(content: string): any[] {
    const tasks: any[] = [];
    
    // Look for task patterns in the response
    const taskPatterns = [
      /(?:Task|Step)\s*\d*:?\s*([^\n]+)/gi,
      /(?:-|•|\*)\s*([^\n]+(?:setup|create|implement|configure|build)[^\n]*)/gi
    ];

    taskPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 10) {
          tasks.push({
            description: match[1].trim(),
            priority: tasks.length + 1,
            type: this.classifyTaskType(match[1])
          });
        }
      }
    });

    return tasks;
  }

  private classifyTaskType(taskDescription: string): string {
    const desc = taskDescription.toLowerCase();
    
    if (desc.includes('ui') || desc.includes('component') || desc.includes('design')) return 'frontend';
    if (desc.includes('api') || desc.includes('server') || desc.includes('backend')) return 'backend';
    if (desc.includes('database') || desc.includes('schema') || desc.includes('data')) return 'database';
    if (desc.includes('auth') || desc.includes('login') || desc.includes('user')) return 'authentication';
    if (desc.includes('test')) return 'testing';
    if (desc.includes('deploy') || desc.includes('production')) return 'deployment';
    
    return 'general';
  }

  private getFallbackPlannerResponse(userMessage: string): AIResponse {
    return {
      content: `Thank you for describing your project idea: "${userMessage}"

I'd love to help you build this! To create the best possible application, I need to understand your vision better.

**Let me ask a few key questions:**

1. **Target Audience**: Who will be using this application? (e.g., businesses, consumers, specific industries)

2. **Core Features**: What are the main actions users should be able to perform?

3. **Technical Preferences**: 
   - Do you need user authentication and accounts?
   - Will this require real-time features (chat, notifications, live updates)?
   - Any specific integrations with external services?

4. **Design & Experience**: 
   - Do you have any design preferences or reference websites you like?
   - Mobile-first or desktop-focused?

5. **Timeline & Scope**: When would you like to launch, and are there any must-have features for the initial version?

Once I understand these details, I can create a comprehensive blueprint and coordinate our AI agents to start building your application!`,
      agentType: 'planner',
      metadata: { fallback: true }
    };
  }

  private getFallbackMainAgentResponse(userMessage: string): AIResponse {
    return {
      content: `I'm coordinating the development team to handle your request: "${userMessage}"

🤖 **Agent Status:**
- Frontend Agent: Ready to implement UI components
- Backend Agent: Standing by for API development  
- Database Agent: Prepared for schema updates

**Current Actions:**
1. Analyzing requirements and breaking down into tasks
2. Preparing development environment 
3. Coordinating agent workflow

I'll provide detailed updates as our specialized agents work on your project. Each agent will contribute their expertise to ensure we build exactly what you need!`,
      agentType: 'main',
      metadata: { fallback: true }
    };
  }
}