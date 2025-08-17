'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Image as ImageIcon, Code, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImageUpload, { UploadedImage } from './ui/ImageUpload';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  images?: UploadedImage[];
  agentType?: string;
}

interface EnhancedChatInterfaceProps {
  onPromptSubmit?: (prompt: string, images?: UploadedImage[]) => void;
  onToggleCodePreview?: () => void;
  showCodePreview?: boolean;
  className?: string;
  conversationId?: string;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onPromptSubmit,
  onToggleCodePreview,
  showCodePreview = false,
  className = "",
  conversationId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
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
    if (!inputValue.trim() && uploadedImages.length === 0) return;

    const userMessage: Message = {
      id: Math.random().toString(36),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setUploadedImages([]);
    setShowImageUpload(false);
    setIsTyping(true);

    // Call the callback if provided
    if (onPromptSubmit) {
      onPromptSubmit(inputValue, uploadedImages.length > 0 ? uploadedImages : undefined);
    }

    // Simulate AI response for now
    setTimeout(() => {
      const aiMessage: Message = {
        id: Math.random().toString(36),
        content: generateAIResponse(inputValue, uploadedImages),
        role: 'assistant',
        timestamp: new Date(),
        agentType: 'planner'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (prompt: string, images?: UploadedImage[]): string => {
    let response = "I understand you want to build something amazing! ";
    
    if (images && images.length > 0) {
      response += `I can see you've uploaded ${images.length} image${images.length > 1 ? 's' : ''}. `;
      
      // Add context based on AI analysis if available
      const analyzedImages = images.filter(img => img.aiAnalysis);
      if (analyzedImages.length > 0) {
        response += "Based on the images you've shared, I can see elements that will help me understand your vision better. ";
      }
    }

    response += `Let me help you bring your vision to life. Could you provide more details about:

- What type of application you have in mind?
- Who is your target audience?
- Any specific features or functionality you'd like to include?

This will help me create the perfect project plan for you!`;

    return response;
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

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  return (
    <motion.div 
      className={`conversation-panel flex flex-col h-[600px] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chat Header */}
      <div className="p-6 border-b border-primary-500/20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-6 h-6 text-secondary-500" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-500">Beaver AI Assistant</h3>
              <p className="text-sm text-secondary-400">Ready to help you build amazing projects</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={onToggleCodePreview}
              className={`p-2 rounded-lg transition-all duration-300 ${
                showCodePreview 
                  ? 'bg-primary-500 text-secondary-500' 
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showCodePreview ? <Eye className="w-5 h-5" /> : <Code className="w-5 h-5" />}
            </motion.button>
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
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-8 h-8 text-secondary-500" />
              </motion.div>
              <h4 className="text-xl font-medium text-secondary-500 mb-2">
                Let's build something incredible together!
              </h4>
              <p className="text-secondary-400">
                Tell me about your project idea and I'll help you bring it to life.
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-primary-400 to-primary-500' 
                        : 'bg-gradient-to-br from-primary-600 to-primary-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-secondary-500" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-500" />
                    )}
                  </motion.div>
                  <div className={`p-4 rounded-lg backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'bg-dark-600/40 border border-primary-500/20'
                  }`}>
                    {/* Message Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {message.images.map((image, imgIndex) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: imgIndex * 0.1 }}
                            className="relative rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.preview}
                              alt={`Upload ${imgIndex + 1}`}
                              className="w-full h-20 object-cover"
                            />
                            {image.aiAnalysis && (
                              <div className="absolute inset-0 bg-dark-800/0 hover:bg-dark-800/80 
                                            transition-all duration-300 flex items-center justify-center
                                            opacity-0 hover:opacity-100">
                                <p className="text-xs text-secondary-400 p-2 text-center">
                                  {image.aiAnalysis}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <div className="prose prose-sm text-secondary-400 max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs text-secondary-500 mt-2 flex items-center space-x-2">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.agentType && (
                        <span className="bg-primary-500/20 px-2 py-1 rounded text-primary-400">
                          {message.agentType}
                        </span>
                      )}
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
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-500" />
              </div>
              <div className="p-4 bg-dark-600/40 border border-primary-500/20 rounded-lg backdrop-blur-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Upload Section */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-4 border-t border-primary-500/20"
          >
            <ImageUpload
              maxImages={5}
              onImagesChange={handleImagesChange}
              className="mt-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <div className="p-6 border-t border-primary-500/20 shrink-0">
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
              className="chat-input min-h-[56px] max-h-32"
              rows={1}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              type="button"
              onClick={() => setShowImageUpload(!showImageUpload)}
              className={`p-3 rounded-lg transition-all duration-300 ${
                showImageUpload || uploadedImages.length > 0
                  ? 'bg-primary-500 text-secondary-500'
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ImageIcon className="w-5 h-5" />
              {uploadedImages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white 
                               text-xs rounded-full flex items-center justify-center">
                  {uploadedImages.length}
                </span>
              )}
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={(!inputValue.trim() && uploadedImages.length === 0) || isTyping}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </form>
        
        <div className="text-xs text-secondary-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedChatInterface;