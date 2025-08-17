'use client';

import React, { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Code, Zap, Sparkles, ArrowRight, Github, Twitter, X } from 'lucide-react';
import { projectTemplates } from '@/data/projectTemplates';

export default function EnhancedLandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-800 via-dark-700 to-dark-800">
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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 border-b border-primary-500/20 bg-dark-700/30 backdrop-blur-sm">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-material flex items-center justify-center">
            <Bot className="w-6 h-6 text-secondary-500" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
            Beaver AI
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button 
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 text-secondary-400 hover:text-secondary-500 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => openAuthModal('signup')}
            className="btn-primary"
          >
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Split Layout */}
      <div className="relative z-10 flex min-h-[calc(100vh-88px)]">
        {/* Left Side - Authentication */}
        <div className="w-1/2 flex items-center justify-center p-12 bg-dark-800/50">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-material flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-secondary-500" />
              </div>
              <h1 className="text-3xl font-bold text-secondary-500 mb-2">
                Create an Account
              </h1>
              <p className="text-secondary-400">
                Already have an account?{' '}
                <button 
                  onClick={() => openAuthModal('signin')}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Log in
                </button>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Google Sign Up */}
              <SignUpButton mode="modal">
                <motion.button 
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-dark-700/50 border border-primary-500/30 rounded-material hover:border-primary-500/50 hover:bg-dark-700/70 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-xs font-bold text-dark-800">G</span>
                  </div>
                  <span className="text-secondary-400">Continue with Google</span>
                </motion.button>
              </SignUpButton>

              {/* GitHub Sign Up */}
              <SignUpButton mode="modal">
                <motion.button 
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-dark-700/50 border border-primary-500/30 rounded-material hover:border-primary-500/50 hover:bg-dark-700/70 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-400">Continue with GitHub</span>
                </motion.button>
              </SignUpButton>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-800/50 text-secondary-500">Or sign up with email</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="brad"
                  className="w-full p-4 bg-dark-700/30 border border-primary-500/30 rounded-material text-secondary-500 placeholder-secondary-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
                <input
                  type="email"
                  placeholder="SyeD@yourcoursecoom.com"
                  className="w-full p-4 bg-dark-700/30 border border-primary-500/30 rounded-material text-secondary-500 placeholder-secondary-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••"
                    className="w-full p-4 bg-dark-700/30 border border-primary-500/30 rounded-material text-secondary-500 placeholder-secondary-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  />
                </div>

                <SignUpButton mode="modal">
                  <motion.button 
                    className="w-full btn-primary text-lg py-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Up
                  </motion.button>
                </SignUpButton>
              </div>

              <p className="text-xs text-secondary-500 text-center mt-6">
                By clicking Sign Up, you agree to our{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-1/2 flex items-center justify-center p-12 bg-gradient-to-br from-primary-500/5 to-secondary-500/10">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-secondary-500 mb-6">
              Build Ambitious App
              <br />
              With AI
            </h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative bg-secondary-500/10 backdrop-blur-sm rounded-material-xl p-6 shadow-material-lg border border-primary-500/20 max-w-md mx-auto"
            >
              {/* Mock Chat Interface */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-primary-500/20 rounded-full px-3 py-1 mb-4">
                  <Bot className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-primary-400">Curious.me</span>
                </div>
                <h3 className="text-lg font-medium text-secondary-400 mb-2">
                  Discover fascinating facts
                  <br />
                  about anything!
                </h3>
                <div className="bg-primary-500/10 rounded-lg p-3 text-sm text-secondary-500">
                  What are you curious about?
                </div>
              </div>

              {/* Mock Project Templates */}
              <div className="grid grid-cols-2 gap-3">
                {projectTemplates.slice(0, 4).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-dark-700/30 rounded-lg p-3 border border-primary-500/20"
                  >
                    <div className="w-full h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded mb-2"></div>
                    <p className="text-xs text-secondary-400 font-medium truncate">
                      {template.title}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Mock navigation dots */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-500/30 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-500/30 rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeAuthModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-700 rounded-material-xl p-8 w-full max-w-md border border-primary-500/20 shadow-material-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-secondary-500">
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h3>
                <button 
                  onClick={closeAuthModal}
                  className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-400" />
                </button>
              </div>

              <div className="space-y-4">
                {authMode === 'signin' ? (
                  <SignInButton mode="modal">
                    <button className="w-full btn-primary">
                      Continue to Sign In
                    </button>
                  </SignInButton>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="w-full btn-primary">
                      Continue to Sign Up
                    </button>
                  </SignUpButton>
                )}
                
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors"
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}