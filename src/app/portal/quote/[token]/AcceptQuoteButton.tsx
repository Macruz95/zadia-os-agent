/**
 * ZADIA OS - Accept Quote Button
 * 
 * Client component for accepting quotes
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AcceptQuoteButtonProps {
  quoteId: string;
  token: string;
}

export function AcceptQuoteButton({ quoteId, token }: AcceptQuoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  
  const handleAccept = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/portal/quote/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, token }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept quote');
      }
      
      setAccepted(true);
      toast.success('Cotización aceptada', {
        description: 'Hemos notificado al proveedor de tu decisión',
      });
      
      // Reload page to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      toast.error('Error al aceptar', {
        description: 'Por favor intente nuevamente',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (accepted) {
    return (
      <Button size="lg" disabled className="gap-2 bg-green-600">
        <Check className="h-4 w-4" />
        Aceptada
      </Button>
    );
  }
  
  return (
    <Button 
      size="lg" 
      onClick={handleAccept}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          Aceptar Cotización
        </>
      )}
    </Button>
  );
}
