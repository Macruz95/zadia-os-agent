'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { TrendingUp, FileText, Briefcase, Calendar, DollarSign, Clock } from 'lucide-react';
import { Transaction, Project, Quote, Client } from '../types/clients.types';
import { formatCurrency } from '../utils/currency.utils';
import { formatDate } from '../utils/date.utils';

interface ClientKPIsCardProps {
  client: Client;
  transactions: Transaction[];
  projects: Project[];
  quotes: Quote[];
}

export const ClientKPIsCard = ({ client, transactions, projects, quotes }: ClientKPIsCardProps) => {
  // Financial KPIs
  const totalInvoiced = transactions
    .filter(t => t.type === 'Factura')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter(t => t.type === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceDue = totalInvoiced - totalPaid;

  // Business KPIs
  const activeProjects = projects.filter(p => 
    p.status === 'EnProgreso' || p.status === 'Planificación'
  ).length;

  const activeQuotes = quotes.filter(q => 
    q.status === 'Enviada' || q.status === 'Borrador'
  ).length;

  // TODO: Oportunidades - Agregar cuando el módulo esté disponible
  const openOpportunities = 0;

  // Timeline KPIs
  const clientSince = formatDate(client.createdAt);
  const lastActivity = client.lastInteractionDate 
    ? formatDate(client.lastInteractionDate)
    : 'Sin actividad';

  // Calculate days as client
  const daysAsClient = Math.floor(
    (new Date().getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          KPIs del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Financial Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Finanzas
            </h4>
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

          {/* Business Activity Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Actividad Comercial
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">{openOpportunities}</div>
                <div className="text-xs text-purple-600 font-medium mt-1">Oportunidades</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-900">{activeQuotes}</div>
                <div className="text-xs text-orange-600 font-medium mt-1 flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3" />
                  Cotizaciones
                </div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-900">{activeProjects}</div>
                <div className="text-xs text-indigo-600 font-medium mt-1 flex items-center justify-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Proyectos
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Cliente desde</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {clientSince}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">Días como cliente</span>
                <Badge variant="outline" className="font-semibold">
                  {daysAsClient} días
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">Última actividad</span>
                <Badge 
                  variant={client.lastInteractionDate ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lastActivity}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};