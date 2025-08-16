'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowLeft, Send, Sparkles, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function NewProject() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    
    try {
      // Create new project and conversation
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify({
          description: message,
          name: extractProjectName(message) || 'New Project'
        })
      });

      if (response.ok) {
        const project = await response.json();
        
        // Start conversation with Planner Agent
        const conversationResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
          },
          body: JSON.stringify({
            projectId: project.id,
            initialMessage: message
          })
        });

        if (conversationResponse.ok) {
          const conversation = await conversationResponse.json();
          router.push(`/dashboard/projects/${project.id}`);
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractProjectName = (description: string): string => {
    const patterns = [
      /(?:build|create|make|develop)\s+(?:a\s+)?(?:web\s+)?(?:app|application|site|platform|tool)\s+(?:for\s+|called\s+|named\s+)?([^.!?]+)/i,
      /(?:I\s+want|I'd\s+like|I\s+need)\s+(?:to\s+)?(?:build|create|make|develop)\s+([^.!?]+)/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim().slice(0, 50);
      }
    }

    return '';
  };

  const suggestions = [
    "I want to build a task management app with real-time collaboration and user authentication",
    "Create a social media dashboard for managing multiple accounts with analytics",
    "Build an e-commerce platform with inventory management and payment processing",
    "Develop a blog platform with markdown support and commenting system",
    "Make a project management tool with team collaboration features"
  ];

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-accent-blue rounded-full mr-2 animate-bounce"></span>
            <span className="inline-block w-3 h-3 bg-accent-purple rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
            <span className="inline-block w-3 h-3 bg-accent-glow rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
          <p className="text-dark-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card/20 to-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border/30 bg-dark-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-dark-muted hover:text-accent-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What would you like to{' '}
            <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
              build today?
            </span>
          </h1>
          
          <p className="text-xl text-dark-muted mb-8 max-w-2xl mx-auto">
            Describe your project idea in natural language. Our AI agents will ask clarifying questions 
            and create a comprehensive development plan.
          </p>
        </motion.div>

        {/* Chat Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: I want to build a task management app with user authentication, real-time collaboration, and mobile support..."
                className="w-full min-h-[120px] bg-dark-card/50 border border-dark-border rounded-xl px-6 py-4 text-white placeholder-dark-muted resize-none focus:outline-none focus:border-accent-blue/50 focus:bg-dark-card/70 transition-all"
                disabled={loading}
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <div className="flex items-center text-xs text-dark-muted">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span>{message.length}/1000</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="btn-futuristic flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Project...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Start Building</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-accent-blue" />
            Need inspiration? Try these examples:
          </h3>
          
          <div className="grid gap-3">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                onClick={() => setMessage(suggestion)}
                className="text-left p-4 bg-dark-card/30 border border-dark-border hover:border-accent-blue/30 rounded-lg transition-all hover:bg-dark-card/50 group"
                disabled={loading}
              >
                <p className="text-dark-text group-hover:text-white transition-colors">
                  "{suggestion}"
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}