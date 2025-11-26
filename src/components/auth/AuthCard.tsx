'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

interface AuthCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

interface AuthCardContentProps {
  children: ReactNode;
  className?: string;
}

interface AuthCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      "bg-[#161b22] border border-gray-800/50 rounded-2xl",
      "shadow-2xl shadow-black/50",
      className
    )}>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function AuthCardHeader({ title, subtitle, icon }: AuthCardHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-6 text-center">
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-white tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function AuthCardContent({ children, className }: AuthCardContentProps) {
  return (
    <div className={cn("px-8 pb-6", className)}>
      {children}
    </div>
  );
}

export function AuthCardFooter({ children, className }: AuthCardFooterProps) {
  return (
    <div className={cn(
      "px-8 py-5 bg-black/20 border-t border-gray-800/50",
      className
    )}>
      {children}
    </div>
  );
}

