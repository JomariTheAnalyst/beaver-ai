'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Bot, Settings, Home, Code, FileText, Plus, Sparkles } from 'lucide-react';
import TabSystem, { Tab } from './ui/TabSystem';
import EnhancedChatInterface from './EnhancedChatInterface';
import CodePreviewPanel from './ui/CodePreviewPanel';
import ProjectTemplateCarousel from './ProjectTemplateCarousel';
import { ProjectTemplate } from '@/data/projectTemplates';
import { UploadedImage } from './ui/ImageUpload';
import toast, { Toaster } from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  status: string;
  updatedAt: Date;
}

const EnhancedDashboard: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [conversationPanelVisible, setConversationPanelVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Initialize with default dashboard tab
    const dashboardTab: Tab = {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      content: <DashboardContent 
        onTemplateSelect={handleTemplateSelect}
        onStartChat={handleStartChat}
      />,
      closable: false
    };
    
    setTabs([dashboardTab]);
    setActiveTab('dashboard');
  }, []);

  const handleTemplateSelect = (prompt: string, template: ProjectTemplate) => {
    setSelectedTemplate(template);
    handleStartChat();
    
    // Auto-fill the prompt in the chat
    setTimeout(() => {
      toast.success(`Template "${template.title}" selected!`);
    }, 500);
  };

  const handleStartChat = () => {
    setConversationPanelVisible(true);
    
    // Scroll to conversation panel smoothly
    setTimeout(() => {
      document.getElementById('conversation-panel')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center' 
      });
    }, 100);
  };

  const handlePromptSubmit = async (prompt: string, images?: UploadedImage[]) => {
    try {
      console.log('Prompt submitted:', prompt);
      console.log('Images:', images);
      console.log('Selected template:', selectedTemplate);
      
      // Here we'll integrate with the backend AI service
      toast.success('Message sent! AI is processing your request...');
      
    } catch (error) {
      console.error('Error submitting prompt:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleAddTab = () => {
    const newTabId = Math.random().toString(36);
    const newTab: Tab = {
      id: newTabId,
      title: 'New Project',
      icon: <Code className="w-4 h-4" />,
      content: <ProjectContent projectId={newTabId} />,
      closable: true
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTabId);
    toast.success('New project tab created!');
  };

  const handleTabClose = (tabId: string) => {
    if (tabId === 'dashboard') return; // Don't close dashboard tab
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    toast.success('Project tab closed');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const toggleCodePreview = () => {
    setShowCodePreview(!showCodePreview);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-2 animate-bounce"></span>
            <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
            <span className="inline-block w-3 h-3 bg-secondary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
          <p className="text-secondary-400">Loading Beaver AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-800 via-dark-700 to-dark-800 overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-dark-700 text-secondary-500 border border-primary-500/30',
        }}
      />
      
      {/* Cloud Background */}
      <div className="cloud-bg">
        <div className="cloud">
          <svg width="100" height="60" viewBox="0 0 100 60" fill="currentColor" className="text-secondary-500">
            <path d="M20,40 Q20,20 40,20 Q60,10 80,20 Q90,15 95,25 Q100,30 95,40 Q90,50 80,45 Q60,50 40,45 Q20,50 20,40 Z"/>
          </svg>
        </div>
        <div className="cloud">
          <svg width="120" height="70" viewBox="0 0 120 70" fill="currentColor" className="text-secondary-500">
            <path d="M25,45 Q25,25 45,25 Q65,15 85,25 Q95,20 100,30 Q105,35 100,45 Q95,55 85,50 Q65,55 45,50 Q25,55 25,45 Z"/>
          </svg>
        </div>
        <div className="cloud">
          <svg width="80" height="50" viewBox="0 0 80 50" fill="currentColor" className="text-secondary-500">
            <path d="M15,35 Q15,20 30,20 Q45,12 60,20 Q70,16 75,25 Q80,28 75,35 Q70,42 60,38 Q45,42 30,38 Q15,42 15,35 Z"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-primary-500/20 bg-dark-700/80 backdrop-blur-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-material flex items-center justify-center">
                <Bot className="w-7 h-7 text-secondary-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-500">Beaver AI</h1>
                <p className="text-sm text-secondary-400">AI-Native Development Platform</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 text-sm text-secondary-400">
                <span>Welcome back,</span>
                <span className="text-secondary-500 font-medium">
                  {user?.firstName || 'Developer'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button 
                  className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-secondary-400 hover:text-secondary-300" />
                </motion.button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-500">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)] relative z-10">
        {/* Left Panel - Tabs and Content */}
        <div className={`transition-all duration-500 ease-in-out ${
          showCodePreview ? 'w-1/2' : 'w-full'
        }`}>
          <TabSystem
            initialTabs={tabs}
            onTabAdd={handleAddTab}
            onTabClose={handleTabClose}
            onTabChange={handleTabChange}
            className="h-full"
          />
        </div>

        {/* Right Panel - Code & Preview */}
        <AnimatePresence>
          {showCodePreview && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              className="w-1/2 border-l border-primary-500/20"
            >
              <CodePreviewPanel
                files={[]}
                previewUrl=""
                onCodeChange={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversation Panel Overlay */}
      <AnimatePresence>
        {conversationPanelVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-800/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setConversationPanelVisible(false)}
          >
            <motion.div
              id="conversation-panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedChatInterface
                onPromptSubmit={handlePromptSubmit}
                onToggleCodePreview={toggleCodePreview}
                showCodePreview={showCodePreview}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{
  onTemplateSelect: (prompt: string, template: ProjectTemplate) => void;
  onStartChat: () => void;
}> = ({ onTemplateSelect, onStartChat }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
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
              <Sparkles className="w-12 h-12 text-primary-500/30" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-secondary-500 mb-6 leading-tight">
              What will you build today?
            </h2>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
              Let AI bring your ideas to life
            </div>
          </div>
          
          <motion.p 
            className="text-xl text-secondary-400 mt-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Choose from our curated templates below or describe your unique vision in the chat.
            Our AI agents will transform your ideas into reality.
          </motion.p>
        </motion.div>

        {/* Quick Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <motion.button 
            onClick={onStartChat}
            className="btn-primary text-lg px-8 py-4 shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start New Project
          </motion.button>
        </motion.div>

        {/* Project Templates */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ProjectTemplateCarousel onTemplateSelect={onTemplateSelect} />
        </motion.div>
      </div>
    </div>
  );
};

// Project Content Component
const ProjectContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Code className="w-8 h-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-medium text-secondary-500 mb-2">
          Project Workspace
        </h3>
        <p className="text-secondary-400 mb-6">
          This is where your project development will happen.
        </p>
        <div className="text-xs text-secondary-500 bg-dark-600/30 rounded-lg p-3 inline-block">
          Project ID: {projectId}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;