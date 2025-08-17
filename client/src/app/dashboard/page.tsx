'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Settings, User as UserIcon, Sparkles } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import ProjectTemplateCarousel from '@/components/ProjectTemplateCarousel';
import { ProjectTemplate } from '@/data/projectTemplates';

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleTemplateSelect = (prompt: string, template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowChat(true);
    
    // Scroll to chat interface smoothly
    setTimeout(() => {
      document.getElementById('chat-interface')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center' 
      });
    }, 100);
  };

  const handlePromptSubmit = (prompt: string) => {
    // Here we'll integrate with AI later
    console.log('Prompt submitted:', prompt);
    console.log('Selected template:', selectedTemplate);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beaver-900 to-beaver-700">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-beaver-500 rounded-full mr-2 animate-bounce"></span>
            <span className="inline-block w-3 h-3 bg-beaver-500 rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
            <span className="inline-block w-3 h-3 bg-beaver-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
          <p className="text-beaver-500">Loading Beaver AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beaver-900 via-beaver-800 to-beaver-900 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-beaver-700/30 bg-beaver-700/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-beaver-700 to-beaver-500 rounded-lg flex items-center justify-center">
                <Bot className="w-7 h-7 text-beaver-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-beaver-300">Beaver AI</h1>
                <p className="text-sm text-beaver-500">AI-Native Development Platform</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 text-sm text-beaver-500">
                <span>Welcome back,</span>
                <span className="text-beaver-300 font-medium">
                  {user?.firstName || 'Developer'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-beaver-700/30 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-beaver-500 hover:text-beaver-300" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-beaver-500 to-beaver-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-beaver-900">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute -top-6 -right-6 w-12 h-12"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-beaver-500/30" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-beaver-300 mb-6 leading-tight">
              Welcome, {user?.firstName || 'Developer'} —
            </h2>
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-beaver-500 to-beaver-300 bg-clip-text text-transparent">
              What will you build today?
            </div>
          </div>
          
          <motion.p 
            className="text-xl text-beaver-500 mt-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Choose from our curated templates below or describe your unique vision in the chat.
            Our AI agents will transform your ideas into reality.
          </motion.p>
        </motion.div>

        {/* Chat Interface */}
        <AnimatePresence>
          {!showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
              id="chat-interface"
            >
              <ChatInterface onPromptSubmit={handlePromptSubmit} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
              id="chat-interface"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-beaver-700/20 border border-beaver-500/30 rounded-full px-4 py-2">
                  <Bot className="w-4 h-4 text-beaver-500" />
                  <span className="text-sm text-beaver-500">
                    {selectedTemplate ? `Using template: ${selectedTemplate.title}` : 'Chat Active'}
                  </span>
                </div>
              </div>
              <ChatInterface onPromptSubmit={handlePromptSubmit} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Templates Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <ProjectTemplateCarousel onTemplateSelect={handleTemplateSelect} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-4 bg-beaver-700/10 border border-beaver-700/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 text-beaver-500">
              <UserIcon className="w-5 h-5" />
              <span className="text-sm">Ready to start building?</span>
            </div>
            <div className="w-px h-6 bg-beaver-700/30"></div>
            <button 
              onClick={() => setShowChat(true)}
              className="btn-futuristic text-sm"
            >
              Open Chat Interface
            </button>
          </div>
        </motion.div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-beaver-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-beaver-700/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-beaver-300/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}