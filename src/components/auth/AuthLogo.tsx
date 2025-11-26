'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Zap } from 'lucide-react';

export function AuthLogo() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
      {!imageError ? (
        <Image 
          src="/zadia-logo.svg" 
          alt="ZADIA OS" 
          width={40} 
          height={40}
          className="brightness-0 invert"
          onError={() => setImageError(true)}
        />
      ) : (
        <Zap className="h-8 w-8 text-white" />
      )}
    </div>
  );
}

