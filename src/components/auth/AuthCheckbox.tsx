'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string;
}

export function AuthCheckbox({ id, checked, onCheckedChange, label, error }: AuthCheckboxProps) {
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={id}
        className="flex items-start gap-3 cursor-pointer group"
      >
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="sr-only"
          />
          <div className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200",
            "flex items-center justify-center",
            checked 
              ? "bg-cyan-500 border-cyan-500" 
              : "bg-transparent border-gray-600 group-hover:border-gray-500"
          )}>
            {checked && (
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-tight">
          {label}
        </span>
      </label>
      
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5 ml-8">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}

