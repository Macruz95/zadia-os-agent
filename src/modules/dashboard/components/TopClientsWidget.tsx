'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TopClient } from '../types/analytics.types';

interface TopClientsWidgetProps {
  clients: TopClient[];
  title?: string;
  maxItems?: number;
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format relative date
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

/**
 * Top Clients Widget component
 * Displays a list of top clients by revenue
 */
export function TopClientsWidget({
  clients,
  title = 'Mejores Clientes',
  maxItems = 5,
}: TopClientsWidgetProps) {
  const displayClients = clients.slice(0, maxItems);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayClients.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No hay datos de clientes
          </div>
        ) : (
          <div className="space-y-4">
            {displayClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 text-sm font-bold text-zinc-300">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-xs text-zinc-500">
                      {formatRelativeDate(client.lastOrder)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatCurrency(client.totalPurchases)}
                  </p>
                  <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                    {client.orderCount} ordenes
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
