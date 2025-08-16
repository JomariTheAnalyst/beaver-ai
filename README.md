# Yawascript 🚀

> *The Future of AI-Native Development*

**Yawascript** is a revolutionary AI-powered development platform that transforms ideas into fully functional web applications through natural conversation alone. No coding required - just describe your vision and watch it come to life.

## ✨ What Makes Yawascript Special

- 🤖 **AI-Native Development**: Sophisticated agent hierarchy handles all technical implementation
- 🎨 **Immersive Interface**: Sleek, futuristic "vibe coding" experience with real-time visualization
- 🔒 **Secure Sandbox**: E2B integration provides isolated, secure development environments
- 💬 **Natural Conversation**: Interact with AI agents through intuitive natural language
- 📱 **Live Preview**: Watch your application build in real-time with instant feedback
- 🚀 **Zero Setup**: Start building immediately - no configuration or environment setup

## 🏗️ Architecture Overview

### AI Agent Hierarchy
```
Planner Agent (User Interface)
    ↓
Main Agent (Orchestrator)
    ├── UI/UX Agent
    ├── Frontend Agent
    ├── Backend Agent
    ├── Data/Logic Agent
    ├── Testing Agent
    ├── Optimization Agent
    └── Deployment Agent
```

### Technology Stack
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Authentication**: Clerk
- **Database**: Prisma + PostgreSQL
- **Execution**: E2B Sandbox
- **Real-time**: WebSocket connections
- **AI Integration**: Custom agent orchestration system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- E2B API access
- Clerk authentication setup

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/yawascript.git
cd yawascript
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# E2B Sandbox
E2B_API_KEY="your_e2b_api_key"

# AI/API Keys
OPENAI_API_KEY="sk_..."
```

4. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building! 🎉

## 🎯 How It Works

### 1. **Describe Your Vision**
Simply tell the Planner Agent what you want to build:
> "I want to create a task management app with user authentication, real-time collaboration, and mobile responsiveness"

### 2. **Collaborative Planning**
The Planner Agent asks clarifying questions to understand your requirements:
- Target audience and use cases
- Specific features and functionality
- Design preferences and branding
- Technical requirements and constraints

### 3. **Automated Development**
Specialized AI agents work together to build your application:
- **UI/UX Agent** designs the interface and user experience
- **Frontend Agent** implements React components and interactions
- **Backend Agent** creates APIs and server-side logic
- **Data Agent** designs database schema and business logic

### 4. **Real-time Preview**
Watch your application come to life with:
- 📁 Live file system updates
- 🖥️ Real-time preview window
- 📋 Streaming development logs
- 💬 Continuous AI agent communication

### 5. **Deploy & Share**
Your application is automatically:
- ✅ Tested for quality and performance
- 🚀 Deployed to production
- 📦 Packaged for easy sharing
- 🔧 Optimized for best practices

## 🎨 Interface Features

### Chat Interface
- **Natural Conversation**: Intuitive dialogue with AI agents
- **Streaming Responses**: Real-time AI feedback and suggestions
- **Code Previews**: Inline syntax-highlighted code blocks
- **Branching Conversations**: Support for iterations and alternatives
- **Context Awareness**: Intelligent understanding of project history

### Development Dashboard
- **File Explorer**: Real-time visualization of project structure
- **Live Preview**: Responsive iframe with automatic refresh
- **Logs Panel**: Streaming terminal output and agent activities
- **Progress Tracking**: Visual indicators of development status

### Design Aesthetic
- 🌃 **Futuristic Dark Theme**: Sleek, professional appearance
- ✨ **Glowing Accents**: Subtle animations and hover effects
- 🎬 **Smooth Transitions**: Fluid page navigation and state changes
- 🎯 **Focused Layout**: Distraction-free development environment

## 🔧 Development

### Project Structure
```
yawascript/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main application
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── agents/               # AI agent implementations
└── types/                # TypeScript type definitions
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow TypeScript best practices
2. Use semantic commit messages
3. Add tests for new features
4. Update documentation as needed
5. Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

- 📚 **Documentation**: [docs.yawascript.com](https://docs.yawascript.com)
- 💬 **Discord**: [Join our community](https://discord.gg/yawascript)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/yawascript/issues)
- 📧 **Email**: support@yawascript.com

## 🚀 What's Next?

Yawascript is just the beginning. We're building the future of software development where:
- Anyone can create sophisticated applications
- AI handles the complexity while you focus on creativity
- Development becomes a collaborative conversation
- Ideas transform into reality at the speed of thought

**Join us in revolutionizing how software is created!** 🌟

---

*Made with ❤️ by the Yawascript team*