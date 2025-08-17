import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

interface AIServiceConfig {
  geminiApiKey: string;
  openRouterApiKey: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // Base64 encoded images
}

interface AIResponse {
  content: string;
  agentType: string;
  metadata?: any;
}

export class AIService {
  private gemini: GoogleGenerativeAI;
  private openRouterApiKey: string;

  constructor(config: AIServiceConfig) {
    this.gemini = new GoogleGenerativeAI(config.geminiApiKey);
    this.openRouterApiKey = config.openRouterApiKey;
  }

  async analyzeImages(images: string[]): Promise<string[]> {
    const analyses: string[] = [];
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (const imageBase64 of images) {
      try {
        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        };

        const prompt = `Analyze this image and provide a brief description focusing on:
        1. Main subjects or objects
        2. Style, design, or aesthetic
        3. UI/UX elements if it's a design mockup
        4. Colors, layout, or composition
        5. How this might relate to web development
        
        Keep it concise, 2-3 sentences.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        analyses.push(response.text().trim());
      } catch (error) {
        console.error('Error analyzing image:', error);
        analyses.push('Unable to analyze this image.');
      }
    }

    return analyses;
  }

  async processChatMessage(messages: ChatMessage[], projectContext?: any): Promise<AIResponse> {
    try {
      // Use Gemini for general chat and project planning
      const model = this.gemini.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      // Build conversation context
      let conversationText = this.buildConversationContext(messages, projectContext);
      
      // Add system prompt for Beaver AI
      const systemPrompt = `You are Beaver AI, an expert AI assistant specialized in web development and application building. You help users create modern, production-ready applications through natural conversation.

Key traits:
- Expert knowledge in React, Next.js, Node.js, TypeScript, TailwindCSS, and modern web technologies
- Ability to understand user requirements and translate them into technical specifications
- Provide detailed, actionable guidance for building applications
- Always consider best practices, security, and user experience
- Be enthusiastic and encouraging while remaining professional

When users describe their project ideas:
1. Ask clarifying questions to understand requirements fully
2. Suggest appropriate tech stacks and architectures
3. Provide detailed implementation plans
4. Offer to help with specific technical challenges
5. Consider scalability and maintainability

Current conversation context:
${conversationText}`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      
      return {
        content: response.text(),
        agentType: 'planner',
        metadata: {
          model: 'gemini-1.5-pro',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error processing chat message:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async generateCode(prompt: string, techStack: string[], projectContext?: any): Promise<AIResponse> {
    try {
      // Use OpenRouter for code generation
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an expert full-stack developer. Generate production-ready code based on user requirements. 

Tech Stack: ${techStack.join(', ')}
Project Context: ${JSON.stringify(projectContext, null, 2)}

Guidelines:
- Write clean, maintainable, and well-documented code
- Follow modern best practices and patterns
- Include proper error handling and validation
- Use TypeScript when applicable
- Implement responsive design with TailwindCSS
- Consider security and performance
- Provide complete, working code snippets`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://beaver-ai.com',
            'X-Title': 'Beaver AI Development Platform'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        agentType: 'developer',
        metadata: {
          model: 'claude-3.5-sonnet',
          timestamp: new Date().toISOString(),
          usage: response.data.usage
        }
      };
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code');
    }
  }

  async optimizeCode(code: string, language: string): Promise<AIResponse> {
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Optimize and improve the following ${language} code:

${code}

Provide optimizations for:
1. Performance improvements
2. Code readability and maintainability
3. Best practices and patterns
4. Security considerations
5. Error handling

Return the optimized code with explanatory comments.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        content: response.text(),
        agentType: 'optimizer',
        metadata: {
          model: 'gemini-1.5-pro',
          language,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error optimizing code:', error);
      throw new Error('Failed to optimize code');
    }
  }

  private buildConversationContext(messages: ChatMessage[], projectContext?: any): string {
    let context = '';
    
    if (projectContext) {
      context += `Project Context:\n${JSON.stringify(projectContext, null, 2)}\n\n`;
    }
    
    context += 'Conversation History:\n';
    messages.forEach((message, index) => {
      context += `${message.role}: ${message.content}\n`;
      if (message.images && message.images.length > 0) {
        context += `[User shared ${message.images.length} image(s)]\n`;
      }
    });
    
    return context;
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Test connection. Respond with "OK".');
      const response = await result.response;
      return response.text().includes('OK');
    } catch (error) {
      console.error('AI service connection test failed:', error);
      return false;
    }
  }
}

export default AIService;