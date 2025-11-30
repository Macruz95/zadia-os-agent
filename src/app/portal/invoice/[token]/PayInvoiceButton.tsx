/**
 * ZADIA OS - Pay Invoice Button
 * 
 * Client component for Stripe checkout
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { createPaymentCheckout } from '@/services/stripe.service';
import { toast } from 'sonner';

interface PayInvoiceButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  tenantId: string;
}

export function PayInvoiceButton({ 
  invoiceId, 
  amount, 
  currency,
  tenantId,
}: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handlePay = async () => {
    setLoading(true);
    
    try {
      const currentUrl = window.location.href;
      
      const result = await createPaymentCheckout({
        tenantId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description: `Pago de factura`,
        invoiceId,
        successUrl: `${currentUrl}?paid=true`,
        cancelUrl: currentUrl,
      });
      
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch {
      toast.error('Error al iniciar el pago', {
        description: 'Por favor intente nuevamente',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      size="lg" 
      onClick={handlePay}
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
          <CreditCard className="h-4 w-4" />
          Pagar Ahora
        </>
      )}
    </Button>
  );
}
