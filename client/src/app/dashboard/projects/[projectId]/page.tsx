'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, ArrowLeft, Send, FileText, Code, Eye, 
  Settings, Play, Pause, RefreshCw, Terminal,
  MessageCircle, Folder, Clock, User
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  agentType?: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  blueprint?: any;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
}

export default function ProjectDetail() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'preview' | 'logs'>('chat');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && projectId) {
      fetchProject();
      fetchConversation();
    }
  }, [isSignedIn, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchConversation = async () => {
    try {
      // For now, we'll use a mock conversation ID based on project ID
      const conversationId = `conv_${projectId}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      // Add user message to conversation
      const newUserMessage: Message = {
        id: `temp_${Date.now()}`,
        content: message,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newUserMessage]
      } : null);

      setMessage('');

      // Send to agent (mock response for now)
      setTimeout(() => {
        const agentResponse: Message = {
          id: `agent_${Date.now()}`,
          content: `Thank you for your message: "${message}". I'm processing your request and will provide a detailed response shortly. Our AI agents are working on implementing the requested features.`,
          role: 'assistant',
          agentType: 'planner',
          createdAt: new Date().toISOString()
        };

        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentResponse]
        } : null);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-accent-blue rounded-full mr-2 animate-bounce"></span>
            <span className="inline-block w-3 h-3 bg-accent-purple rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
            <span className="inline-block w-3 h-3 bg-accent-glow rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
          <p className="text-dark-muted">Loading Project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card/20 to-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border/30 bg-dark-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-dark-muted hover:text-accent-blue transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <div className="h-6 w-px bg-dark-border"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{project?.name || 'Loading...'}</h1>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      project?.status === 'COMPLETED' ? 'bg-green-500' :
                      project?.status === 'DEVELOPMENT' ? 'bg-yellow-500' :
                      project?.status === 'PLANNING' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-dark-muted capitalize">
                      {project?.status?.toLowerCase() || 'Loading'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg border border-dark-border hover:bg-dark-card/50 transition-colors">
                <Settings className="w-5 h-5 text-dark-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Sidebar - Project Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-card/30 border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
              {project?.description && (
                <p className="text-dark-muted text-sm mb-4">{project.description}</p>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-dark-muted" />
                  <span className="text-dark-muted">
                    Created {project ? new Date(project.createdAt).toLocaleDateString() : '...'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-dark-muted" />
                  <span className="text-dark-muted">AI Agent Team Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-dark-card/30 border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-3 text-left hover:bg-dark-card/50 rounded-lg transition-colors">
                  <Play className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Deploy Project</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-3 text-left hover:bg-dark-card/50 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-accent-blue" />
                  <span className="text-sm">Rebuild Application</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-3 text-left hover:bg-dark-card/50 rounded-lg transition-colors">
                  <FileText className="w-4 h-4 text-accent-purple" />
                  <span className="text-sm">View Blueprint</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 mb-4 bg-dark-card/30 p-1 rounded-lg">
              {[
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'files', label: 'Files', icon: Folder },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'logs', label: 'Logs', icon: Terminal }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent-blue text-white'
                      : 'text-dark-muted hover:text-white hover:bg-dark-card/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-dark-card/30 border border-dark-border rounded-xl h-full flex flex-col">
              {activeTab === 'chat' && (
                <>
                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="loading-dots mb-4">
                          <span className="inline-block w-3 h-3 bg-accent-blue rounded-full mr-2 animate-bounce"></span>
                          <span className="inline-block w-3 h-3 bg-accent-purple rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
                          <span className="inline-block w-3 h-3 bg-accent-glow rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        </div>
                        <p className="text-dark-muted">Loading conversation...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversation?.messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${
                              msg.role === 'user'
                                ? 'bg-accent-blue text-white'
                                : 'bg-dark-card border border-dark-border'
                            } rounded-xl p-4`}>
                              {msg.role === 'assistant' && msg.agentType && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <Bot className="w-4 h-4 text-accent-blue" />
                                  <span className="text-xs text-accent-blue font-medium">
                                    {msg.agentType.charAt(0).toUpperCase() + msg.agentType.slice(1)} Agent
                                  </span>
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div className="text-xs opacity-70 mt-2">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-dark-border">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask the AI agents about your project..."
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted focus:outline-none focus:border-accent-blue/50"
                          disabled={sending}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}

              {activeTab === 'files' && (
                <div className="p-6 text-center">
                  <Folder className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">File Explorer</h4>
                  <p className="text-dark-muted">File system integration coming soon...</p>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="p-6 text-center">
                  <Eye className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Live Preview</h4>
                  <p className="text-dark-muted">Real-time preview coming soon...</p>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="p-6 text-center">
                  <Terminal className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Development Logs</h4>
                  <p className="text-dark-muted">Agent activity logs coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}