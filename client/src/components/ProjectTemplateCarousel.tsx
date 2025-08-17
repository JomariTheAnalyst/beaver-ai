'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Code, Database } from 'lucide-react';
import { projectTemplates, type ProjectTemplate } from '../data/projectTemplates';

interface ProjectTemplateCarouselProps {
  onTemplateSelect: (prompt: string, template: ProjectTemplate) => void;
}

const ProjectTemplateCarousel: React.FC<ProjectTemplateCarouselProps> = ({ onTemplateSelect }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Create an infinite loop by duplicating the templates
  const duplicatedTemplates = [...projectTemplates, ...projectTemplates];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Reset to start when we've moved through all original templates
        if (nextIndex >= projectTemplates.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTemplateClick = useCallback((template: ProjectTemplate) => {
    onTemplateSelect(template.prompt, template);
  }, [onTemplateSelect]);

  const getTechStackIcon = (tech: string) => {
    if (tech.toLowerCase().includes('react') || tech.toLowerCase().includes('vue') || tech.toLowerCase().includes('angular')) {
      return <Code className="w-3 h-3" />;
    }
    if (tech.toLowerCase().includes('node') || tech.toLowerCase().includes('express') || tech.toLowerCase().includes('laravel')) {
      return <Zap className="w-3 h-3" />;
    }
    if (tech.toLowerCase().includes('mongo') || tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('mysql')) {
      return <Database className="w-3 h-3" />;
    }
    return <Code className="w-3 h-3" />;
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-beaver-300 mb-2">
          Choose from Our Project Templates
        </h3>
        <p className="text-beaver-500">
          Click any template to automatically fill the chat with a detailed project prompt
        </p>
      </div>

      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex space-x-6"
          animate={{
            x: isPaused ? 0 : `-${currentIndex * 320}px`
          }}
          transition={{
            duration: isPaused ? 0.3 : 1.5,
            ease: 'easeInOut'
          }}
          style={{
            width: `${duplicatedTemplates.length * 320}px`
          }}
        >
          {duplicatedTemplates.map((template, index) => (
            <motion.div
              key={`${template.id}-${Math.floor(index / projectTemplates.length)}`}
              className="template-card w-80 h-96 p-6 cursor-pointer flex-shrink-0 transform-3d"
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 20
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTemplateClick(template)}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Template Image/Icon */}
              <div className="w-full h-32 bg-gradient-to-br from-beaver-700/40 to-beaver-500/30 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {template.imageUrl ? (
                  <img 
                    src={template.imageUrl} 
                    alt={template.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to gradient with icon
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-beaver-700/60 to-beaver-500/40 flex items-center justify-center">
                  <div className="w-12 h-12 bg-beaver-300/20 rounded-full flex items-center justify-center">
                    <Code className="w-6 h-6 text-beaver-300" />
                  </div>
                </div>
                
                {template.featured && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-r from-beaver-500 to-beaver-300 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-beaver-900">Featured</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Content */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-beaver-300 mb-2 line-clamp-1">
                  {template.title}
                </h4>
                
                <p className="text-sm text-beaver-500 mb-4 line-clamp-3">
                  {template.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.techStack.slice(0, 3).map((tech, techIndex) => (
                      <div 
                        key={techIndex}
                        className="flex items-center space-x-1 bg-beaver-700/30 px-2 py-1 rounded text-xs text-beaver-300"
                      >
                        {getTechStackIcon(tech)}
                        <span>{tech}</span>
                      </div>
                    ))}
                    {template.techStack.length > 3 && (
                      <div className="flex items-center bg-beaver-700/30 px-2 py-1 rounded text-xs text-beaver-400">
                        +{template.techStack.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Use Template Button */}
                <motion.button
                  className="w-full bg-gradient-to-r from-beaver-700 to-beaver-500 
                           hover:from-beaver-700/90 hover:to-beaver-500/90
                           text-beaver-300 font-medium py-2 px-4 rounded-lg
                           transition-all duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Gradient Overlays for smooth infinite scroll effect */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-beaver-900 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-beaver-900 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {projectTemplates.slice(0, 5).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              Math.floor(currentIndex / 3) === index 
                ? 'bg-beaver-300' 
                : 'bg-beaver-700'
            }`}
            onClick={() => setCurrentIndex(index * 3)}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-beaver-500">
          Hover over any card to pause the carousel • {projectTemplates.length} templates available
        </p>
      </div>
    </div>
  );
};

export default ProjectTemplateCarousel;