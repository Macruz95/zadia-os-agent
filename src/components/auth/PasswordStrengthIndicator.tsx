'use client';

import { useMemo } from 'react';
import { Check, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Una letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /\d/.test(password) },
    { label: 'Un carácter especial (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: 'Muy débil', color: 'bg-red-500' };
    if (metCount <= 2) return { level: 1, label: 'Débil', color: 'bg-orange-500' };
    if (metCount <= 3) return { level: 2, label: 'Media', color: 'bg-yellow-500' };
    if (metCount <= 4) return { level: 3, label: 'Fuerte', color: 'bg-emerald-500' };
    return { level: 4, label: 'Muy fuerte', color: 'bg-cyan-500' };
  }, [requirements]);

  const ShieldIcon = useMemo(() => {
    if (strength.level <= 1) return ShieldAlert;
    if (strength.level <= 3) return Shield;
    return ShieldCheck;
  }, [strength.level]);

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className={cn(
              "h-4 w-4",
              strength.level <= 1 && "text-red-400",
              strength.level === 2 && "text-yellow-400",
              strength.level === 3 && "text-emerald-400",
              strength.level === 4 && "text-cyan-400"
            )} />
            <span className="text-xs font-medium text-gray-400">
              Seguridad: <span className={cn(
                strength.level <= 1 && "text-red-400",
                strength.level === 2 && "text-yellow-400",
                strength.level === 3 && "text-emerald-400",
                strength.level === 4 && "text-cyan-400"
              )}>{strength.label}</span>
            </span>
          </div>
        </div>
        
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                index <= strength.level ? strength.color : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 transition-colors duration-200",
              req.met ? "text-emerald-400" : "text-gray-500"
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

