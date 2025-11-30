/**
 * ZADIA OS - Chat Input Component
 * 
 * Professional input area with:
 * - Auto-resize textarea
 * - File attachments
 * - Keyboard shortcuts
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
} from 'lucide-react';
import type { Attachment } from '../types';

interface ChatInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Escribe tu mensaje... (Shift+Enter para nueva línea)',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || disabled) return;
    onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, disabled, onSend, attachments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          base64: reader.result as string,
          mimeType: file.type,
          size: file.size,
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="border-t border-gray-800/50 bg-[#0d1117]">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map(att => (
            <div 
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 group"
            >
              {att.type === 'image' ? (
                <ImageIcon className="h-4 w-4 text-cyan-400" />
              ) : (
                <Paperclip className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-300 max-w-[150px] truncate">{att.name}</span>
              <button 
                onClick={() => removeAttachment(att.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className={cn(
          "relative flex items-end gap-2 rounded-2xl border transition-all",
          "bg-[#161b22] border-gray-800/50",
          "focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10"
        )}>
          {/* File Upload Button (Left Side) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-10 w-10 p-0 ml-2 mb-2 text-gray-500 hover:text-white hover:bg-gray-800/50 rounded-xl"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 min-h-[44px] max-h-[200px] py-3 px-1",
              "bg-transparent border-0 resize-none",
              "text-white placeholder:text-gray-600",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            rows={1}
          />

          {/* Send Button */}
          <div className="mr-2 mb-2">
            <Button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              size="sm"
              className={cn(
                "h-10 w-10 p-0 rounded-xl transition-all",
                input.trim() && !disabled
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-gray-800 text-gray-600"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-[10px] text-gray-600">
            ZADIA puede cometer errores. Verifica la información importante.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 border border-gray-700/50">Enter</kbd>
            <span>enviar</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 border border-gray-700/50">Shift+Enter</kbd>
            <span>nueva línea</span>
          </div>
        </div>
      </div>
    </div>
  );
}
