'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Package, CheckCircle, X } from 'lucide-react';
import { InventoryAlert } from '../../types/inventory-extended.types';
import { InventoryAlertsService } from '../../services/entities/inventory-alerts.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface StockAlertsCardProps {
  alerts: InventoryAlert[];
  onRefresh?: () => void;
}

export function StockAlertsCard({ alerts, onRefresh }: StockAlertsCardProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleMarkAsRead = async (alertId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await InventoryAlertsService.markAlertAsRead(alertId, user.uid);
      onRefresh?.();
    } catch (error) {
      logger.error('Error marking alert as read:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || alerts.length === 0) return;
    
    try {
      setLoading(true);
      const alertIds = alerts.map(alert => alert.id);
      await InventoryAlertsService.markMultipleAlertsAsRead(alertIds, user.uid);
      onRefresh?.();
    } catch (error) {
      logger.error('Error marking all alerts as read:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Package className="h-4 w-4" />;
      case 'low': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Stock
        </CardTitle>
        {alerts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">¡Excelente!</p>
            <p className="text-sm">No hay alertas de stock pendientes</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getPriorityIcon(alert.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {alert.itemName}
                          </p>
                          <Badge 
                            variant={getPriorityColor(alert.priority)}
                            className="text-xs"
                          >
                            {alert.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          SKU: {alert.itemSku}
                        </p>
                        <p className="text-sm text-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Stock: {alert.currentStock}</span>
                          <span>Mínimo: {alert.minimumStock}</span>
                          <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                      disabled={loading}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}