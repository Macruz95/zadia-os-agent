'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Transaction } from '../types/clients.types';
import { formatCurrency } from '../utils/currency.utils';

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
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 font-medium">Total Facturado</div>
              <div className="text-lg font-bold text-blue-900">{formatCurrency(totalInvoiced)}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 font-medium">Total Pagado</div>
              <div className="text-lg font-bold text-green-900">{formatCurrency(totalPaid)}</div>
            </div>
            <div className={`p-3 rounded-lg ${balanceDue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className={`text-xs font-medium ${balanceDue > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                Saldo Pendiente
              </div>
              <div className={`text-lg font-bold ${balanceDue > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                {formatCurrency(balanceDue)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};