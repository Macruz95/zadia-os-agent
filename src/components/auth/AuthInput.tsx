'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, error, showPasswordToggle, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="relative group">
          {/* Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
              {icon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full h-12 rounded-xl",
              "bg-[#0d1117] border border-gray-700/50",
              "text-white placeholder:text-gray-600",
              "focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
              "transition-all duration-200",
              icon && "pl-12",
              (isPassword && showPasswordToggle) && "pr-12",
              !icon && "pl-4",
              !(isPassword && showPasswordToggle) && "pr-4",
              error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          
          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          
          {/* Focus glow effect */}
          <div className="absolute inset-0 rounded-xl bg-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

