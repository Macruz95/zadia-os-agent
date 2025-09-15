'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Transaction } from '../types/clients.types';
import { formatCurrency } from '../utils/clients.utils';

interface ClientKPIsCardProps {
  transactions: Transaction[];
}

export const ClientKPIsCard = ({ transactions }: ClientKPIsCardProps) => {
  // Calculate KPIs
  const totalInvoiced = transactions
    .filter(t => t.type === 'Factura')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter(t => t.type === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceDue = totalInvoiced - totalPaid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">KPIs Financieros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Facturado</span>
            <span className="font-medium">{formatCurrency(totalInvoiced)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Pagado</span>
            <span className="font-medium">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Saldo Pendiente</span>
            <span className={`font-medium ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};