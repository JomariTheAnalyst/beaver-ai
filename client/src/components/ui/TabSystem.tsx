'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Home, Code, FileText, Settings } from 'lucide-react';

export interface Tab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closable?: boolean;
}

interface TabSystemProps {
  initialTabs?: Tab[];
  onTabAdd?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

const TabSystem: React.FC<TabSystemProps> = ({
  initialTabs = [],
  onTabAdd,
  onTabClose,
  onTabChange,
  className = ""
}) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<string>(
    initialTabs.length > 0 ? initialTabs[0].id : ''
  );

  useEffect(() => {
    if (initialTabs.length > 0 && !activeTab) {
      setActiveTab(initialTabs[0].id);
    }
  }, [initialTabs, activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleTabClose = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    onTabClose?.(tabId);
    
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
        onTabChange?.(remainingTabs[0].id);
      }
    }
  };

  const handleAddTab = () => {
    onTabAdd?.();
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Bar */}
      <div className="tab-container flex items-center px-4 shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              layout
              className={`tab-item group relative flex items-center space-x-2 cursor-pointer select-none ${
                activeTab === tab.id ? 'active' : ''
              }`}
              onClick={() => handleTabClick(tab.id)}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              {tab.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {tab.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{tab.title}</span>
              
              {tab.closable !== false && (
                <motion.button
                  className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 
                           hover:bg-primary-500/20 rounded-sm transition-all duration-200"
                  onClick={(e) => handleTabClose(tab.id, e)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
              
              {/* Active tab indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  layoutId="activeTabIndicator"
                  initial={false}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        {onTabAdd && (
          <motion.button
            className="tab-add"
            onClick={handleAddTab}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTabContent && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTabContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TabSystem;