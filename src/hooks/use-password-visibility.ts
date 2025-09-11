'use client';

import { useState } from 'react';

/**
 * Hook for managing password visibility toggle
 */
export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible(!isVisible);
  
  const type = isVisible ? 'text' : 'password';

  return {
    isVisible,
    toggle,
    type
  };
}
