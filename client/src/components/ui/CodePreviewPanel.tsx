'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Eye, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface CodePreviewPanelProps {
  files?: CodeFile[];
  previewUrl?: string;
  onCodeChange?: (fileId: string, content: string) => void;
  className?: string;
}

const CodePreviewPanel: React.FC<CodePreviewPanelProps> = ({
  files = [],
  previewUrl,
  onCodeChange,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<string>(
    files.length > 0 ? files[0].id : ''
  );
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const currentFile = files.find(f => f.id === selectedFile);

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-96 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className={`code-preview-panel ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setViewMode('code')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              viewMode === 'code'
                ? 'bg-primary-500 text-secondary-500'
                : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">Code</span>
          </motion.button>
          
          <motion.button
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              viewMode === 'preview'
                ? 'bg-primary-500 text-secondary-500'
                : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Preview</span>
          </motion.button>
        </div>

        {viewMode === 'preview' && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                deviceMode === 'desktop'
                  ? 'bg-primary-500 text-secondary-500'
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Monitor className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => setDeviceMode('tablet')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                deviceMode === 'tablet'
                  ? 'bg-primary-500 text-secondary-500'
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tablet className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                deviceMode === 'mobile'
                  ? 'bg-primary-500 text-secondary-500'
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => window.location.reload()}
              className="p-2 text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10 
                       rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex"
            >
              {/* File List */}
              {files.length > 1 && (
                <div className="w-48 border-r border-primary-500/20 bg-dark-700/50">
                  <div className="p-3 border-b border-primary-500/20">
                    <h4 className="text-sm font-medium text-secondary-400">Files</h4>
                  </div>
                  <div className="space-y-1 p-2">
                    {files.map((file) => (
                      <motion.button
                        key={file.id}
                        onClick={() => setSelectedFile(file.id)}
                        className={`w-full text-left p-2 rounded text-sm transition-all duration-300 ${
                          selectedFile === file.id
                            ? 'bg-primary-500 text-secondary-500'
                            : 'text-secondary-400 hover:text-secondary-300 hover:bg-primary-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {file.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Editor */}
              <div className="flex-1 overflow-auto">
                {currentFile ? (
                  <div className="h-full">
                    <div className="p-3 bg-dark-600/30 border-b border-primary-500/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-secondary-400 ml-4">
                          {currentFile.name}
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={currentFile.content}
                      onChange={(e) => onCodeChange?.(currentFile.id, e.target.value)}
                      className="w-full h-full p-4 bg-dark-800 text-secondary-400 font-mono text-sm 
                               border-none outline-none resize-none"
                      placeholder="Your code will appear here..."
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-secondary-500">
                    No file selected
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center bg-gray-100"
            >
              {previewUrl ? (
                <div className={`bg-white shadow-2xl transition-all duration-500 ${getDeviceClass()}`}>
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-400 mb-2">
                    No Preview Available
                  </h3>
                  <p className="text-secondary-500">
                    Start building your project to see a live preview here.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodePreviewPanel;