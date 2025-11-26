'use client';

import { Bot, BarChart3, Zap, Shield } from 'lucide-react';

const features = [
  { icon: Bot, label: "IA Agéntica" },
  { icon: BarChart3, label: "Gemelo Digital" },
  { icon: Zap, label: "Tiempo Real" },
  { icon: Shield, label: "Seguro" },
];

export function AuthFeaturePills() {
  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-md">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div 
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm"
          >
            <Icon className="h-4 w-4 text-cyan-400" />
            <span>{feature.label}</span>
          </div>
        );
      })}
    </div>
  );
}

