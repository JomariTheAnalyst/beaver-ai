'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Bot, Code, Zap, Sparkles, ArrowRight, Github, Twitter } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beaver-900 via-beaver-800 to-beaver-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-beaver-700/30">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-beaver-700 to-beaver-500 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-beaver-300" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-beaver-500 to-beaver-300 bg-clip-text text-transparent">
            Beaver AI
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-beaver-300 hover:text-beaver-500 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-futuristic">
              Get Started
            </button>
          </SignUpButton>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-beaver-700/20 border border-beaver-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-beaver-500" />
              <span className="text-sm text-beaver-500 font-medium">The Future of AI-Native Development</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-beaver-300">
              Transform Ideas into{' '}
              <span className="bg-gradient-to-r from-beaver-500 via-beaver-300 to-beaver-300 bg-clip-text text-transparent">
                Web Applications
              </span>
            </h1>
            
            <p className="text-xl text-beaver-500 mb-8 max-w-3xl mx-auto leading-relaxed">
              No coding required. Just describe your vision and watch our AI agents collaborate 
              to build, test, and deploy fully functional applications in real-time.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <SignUpButton mode="modal">
              <button className="btn-futuristic flex items-center space-x-2 text-lg px-8 py-4">
                <span>Start Building</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            
            <button className="flex items-center space-x-2 px-8 py-4 border border-dark-border rounded-lg hover:border-accent-blue/50 transition-colors">
              <span>Watch Demo</span>
              <span className="text-accent-blue">▶</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              What Makes Beaver AI{' '}
              <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                Special
              </span>
            </h2>
            <p className="text-xl text-dark-muted max-w-3xl mx-auto">
              Advanced AI agent hierarchy handles all technical implementation while you focus on your vision
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-card/30 border border-dark-border rounded-xl p-8 hover:border-accent-blue/30 transition-all duration-300 vibe-glow-static"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-dark-muted leading-relaxed">{feature.description}</p>
                
                <div className="mt-6">
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-dark-muted">
                        <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mr-3"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-dark-card/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-dark-muted">
              From idea to deployed application in minutes, not months
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-center space-x-8"
              >
                <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {index + 1}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-dark-muted">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-dark-muted mb-8">
            Join thousands of creators who are already building with AI
          </p>
          
          <SignUpButton mode="modal">
            <button className="btn-futuristic text-lg px-12 py-4">
              Start Your First Project
            </button>
          </SignUpButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border/30 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-accent-blue" />
            <span className="font-bold">Beaver AI</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-dark-muted hover:text-accent-blue transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-muted hover:text-accent-blue transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Bot,
    title: 'AI Agent Hierarchy',
    description: 'Sophisticated agent system with specialized roles for different aspects of development',
    highlights: [
      'Planner Agent for requirements',
      'Specialized development agents',
      'Automated coordination'
    ]
  },
  {
    icon: Code,
    title: 'Live Development',
    description: 'Watch your application being built in real-time with instant preview and feedback',
    highlights: [
      'Real-time file system updates',
      'Live preview window',
      'Streaming development logs'
    ]
  },
  {
    icon: Zap,
    title: 'Secure Sandbox',
    description: 'E2B integration provides isolated, secure development environments for safe execution',
    highlights: [
      'Isolated environments',
      'Safe code execution',
      'Full development workflow'
    ]
  }
];

const steps = [
  {
    title: 'Describe Your Vision',
    description: 'Simply tell our Planner Agent what you want to build through natural conversation'
  },
  {
    title: 'Collaborative Planning',
    description: 'The AI asks clarifying questions to understand your requirements and create a blueprint'
  },
  {
    title: 'Automated Development',
    description: 'Specialized agents work together to build your application while you watch in real-time'
  },
  {
    title: 'Deploy & Share',
    description: 'Your application is automatically tested, optimized, and ready for production deployment'
  }
];