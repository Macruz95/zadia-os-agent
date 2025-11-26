/**
 * ZADIA Command - Provider Component
 * 
 * Global provider for command palette with keyboard shortcuts
 * REGLA 5: < 100 líneas
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CommandBar } from '@/components/CommandBar';

interface CommandContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandContext = createContext<CommandContextType | null>(null);

export function useCommandContext() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommandContext must be used within CommandProvider');
  }
  return context;
}

interface CommandProviderProps {
  children: ReactNode;
}

export function CommandProvider({ children }: CommandProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global keyboard shortcut - Note: CommandBar also has this, but we keep state here
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CommandContext.Provider value={{ open, close, isOpen }}>
      {children}
      {/* CommandBar handles its own state and rendering */}
      <CommandBar />
    </CommandContext.Provider>
  );
}
