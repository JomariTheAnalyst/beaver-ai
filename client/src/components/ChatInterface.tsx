'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onPromptSubmit?: (prompt: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onPromptSubmit }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Call the callback if provided
    if (onPromptSubmit) {
      onPromptSubmit(inputValue);
    }

    // Simulate AI response for now
    setTimeout(() => {
      const aiMessage: Message = {
        id: Math.random().toString(36),
        content: "I understand you want to build something amazing! Let me help you bring your vision to life. Could you provide more details about:\n\n- What type of application you have in mind?\n- Who is your target audience?\n- Any specific features or functionality you'd like to include?\n\nThis will help me create the perfect project plan for you!",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleTextareaResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container glimmer-effect w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-6 border-b border-beaver-500/20">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-beaver-700 to-beaver-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-beaver-300" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-beaver-300">Beaver AI Assistant</h3>
            <p className="text-sm text-beaver-500">Ready to help you build amazing projects</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-beaver-700 to-beaver-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-beaver-300" />
              </div>
              <h4 className="text-xl font-medium text-beaver-300 mb-2">
                Let's build something incredible together!
              </h4>
              <p className="text-beaver-500">
                Tell me about your project idea and I'll help you bring it to life.
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-beaver-500 to-beaver-300' 
                      : 'bg-gradient-to-br from-beaver-700 to-beaver-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-beaver-900" />
                    ) : (
                      <Bot className="w-4 h-4 text-beaver-300" />
                    )}
                  </div>
                  <div className={`p-4 rounded-lg backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-beaver-500/20 border border-beaver-500/30'
                      : 'bg-beaver-700/20 border border-beaver-700/30'
                  }`}>
                    <div className="prose prose-sm text-beaver-300 max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs text-beaver-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gradient-to-br from-beaver-700 to-beaver-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-beaver-300" />
              </div>
              <div className="p-4 bg-beaver-700/20 border border-beaver-700/30 rounded-lg backdrop-blur-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-beaver-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-beaver-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-beaver-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-beaver-500/20">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTextareaResize();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Describe your project idea..."
              className="w-full p-4 bg-beaver-700/20 border border-beaver-500/30 rounded-lg 
                         text-beaver-300 placeholder-beaver-500 resize-none min-h-[56px] max-h-32
                         focus:outline-none focus:border-beaver-300/50 focus:ring-2 focus:ring-beaver-300/20
                         backdrop-blur-sm transition-all duration-200"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-4 bg-gradient-to-r from-beaver-700 to-beaver-500 
                     hover:from-beaver-700/90 hover:to-beaver-500/90
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-beaver-300 rounded-lg transition-all duration-200
                     hover:shadow-lg hover:shadow-beaver-500/20
                     disabled:hover:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="text-xs text-beaver-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;