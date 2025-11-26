'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: ReactNode;
}

export function AuthButton({
  children,
  isLoading,
  loadingText,
  variant = 'primary',
  icon,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  const variants = {
    primary: cn(
      "bg-gradient-to-r from-cyan-500 to-cyan-600",
      "hover:from-cyan-400 hover:to-cyan-500",
      "text-white font-semibold",
      "shadow-lg shadow-cyan-500/25",
      "hover:shadow-cyan-500/40",
      "border border-cyan-400/20"
    ),
    secondary: cn(
      "bg-gray-800 hover:bg-gray-700",
      "text-white font-medium",
      "border border-gray-700"
    ),
    outline: cn(
      "bg-transparent",
      "border border-gray-600 hover:border-gray-500",
      "text-gray-300 hover:text-white",
      "hover:bg-gray-800/50"
    ),
    ghost: cn(
      "bg-transparent hover:bg-gray-800/50",
      "text-gray-400 hover:text-white"
    )
  };

  return (
    <button
      className={cn(
        "relative w-full h-12 rounded-xl",
        "flex items-center justify-center gap-2",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "overflow-hidden group",
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer effect for primary */}
      {variant === 'primary' && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{loadingText || 'Cargando...'}</span>
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </span>
    </button>
  );
}

