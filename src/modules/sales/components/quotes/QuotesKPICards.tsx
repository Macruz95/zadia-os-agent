import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { AnimatedCard, AnimatedNumber } from '@/components/ui/motion';
import { Quote } from '../../types/sales.types';

interface QuotesKPICardsProps {
  quotes: Quote[];
}

export function QuotesKPICards({ quotes }: QuotesKPICardsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const pendingQuotes = quotes.filter(q => q.status === 'sent').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AnimatedCard delay={0} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Cotizaciones
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={totalQuotes} />
          </div>
          <p className="text-xs text-muted-foreground">
            Generadas este mes
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.1} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={totalValue} format={(val) => formatCurrency(val)} />
          </div>
          <p className="text-xs text-muted-foreground">
            En cotizaciones activas
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.2} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pendientes
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={pendingQuotes} />
          </div>
          <p className="text-xs text-muted-foreground">
            Esperando respuesta
          </p>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.3} glowColor="primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasa de Aceptación
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0} />%
          </div>
          <p className="text-xs text-muted-foreground">
            {acceptedQuotes} de {totalQuotes} aceptadas
          </p>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}