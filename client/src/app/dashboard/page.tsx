'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plus, Folder, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchProjects();
    }
  }, [isSignedIn]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    router.push('/dashboard/new-project');
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
          <p className="text-dark-muted">Loading Dashboard...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Beaver AI</h1>
                <p className="text-sm text-dark-muted">AI-Native Development Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-dark-muted">
                <span>Welcome back,</span>
                <span className="text-accent-blue font-medium">{user?.firstName || 'Developer'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-sm font-medium text-accent-blue">
                  {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-xl p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-3">
                  Ready to build something amazing?
                </h2>
                <p className="text-dark-muted text-lg mb-6">
                  Describe your vision and watch our AI agents transform it into reality.
                </p>
                <button
                  onClick={handleCreateProject}
                  className="btn-futuristic flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Start New Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="hidden md:block">
                <Sparkles className="w-20 h-20 text-accent-blue/30" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Your Projects</h3>
            <button
              onClick={handleCreateProject}
              className="flex items-center space-x-2 px-4 py-2 border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-dark-card/30 border border-dark-border rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-dark-border rounded mb-3"></div>
                  <div className="h-3 bg-dark-border rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-dark-border rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-dark-card border border-dark-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-dark-muted" />
              </div>
              <h4 className="text-xl font-medium mb-3">No projects yet</h4>
              <p className="text-dark-muted mb-6 max-w-md mx-auto">
                Start your first AI-powered development project. Just describe what you want to build!
              </p>
              <button
                onClick={handleCreateProject}
                className="btn-futuristic"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <div className="bg-dark-card/30 border border-dark-border hover:border-accent-blue/50 rounded-xl p-6 transition-all duration-300 hover:bg-dark-card/50 cursor-pointer vibe-glow-static">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg flex items-center justify-center">
                          <Bot className="w-6 h-6 text-accent-blue" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            project.status === 'COMPLETED' ? 'bg-green-500' :
                            project.status === 'DEVELOPMENT' ? 'bg-yellow-500' :
                            project.status === 'PLANNING' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-xs text-dark-muted capitalize">
                            {project.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold mb-2 group-hover:text-accent-blue transition-colors">
                        {project.name}
                      </h4>
                      
                      {project.description && (
                        <p className="text-dark-muted text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-dark-muted">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}