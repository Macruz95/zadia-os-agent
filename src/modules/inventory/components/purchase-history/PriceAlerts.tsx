'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceAlert } from '../../types/inventory-extended.types';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { PurchasePriceAnalysisService } from '../../services/purchase-price-analysis.service';
import { useTenantId } from '@/contexts/TenantContext';
import { formatCurrency } from '@/lib/utils';

interface PriceAlertsProps {
    rawMaterialId: string;
    threshold?: number; // % de variación para alertar
}

export function PriceAlerts({ rawMaterialId, threshold = 10 }: PriceAlertsProps) {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const tenantId = useTenantId();

    useEffect(() => {
        if (!tenantId || !rawMaterialId) return;

        const loadAlerts = async () => {
            try {
                setLoading(true);
                const history = await PurchaseHistoryService.getPurchaseHistory(
                    rawMaterialId,
                    tenantId,
                    20
                );

                if (history.length > 0) {
                    const detected = PurchasePriceAnalysisService.detectPriceChanges(history, threshold);
                    setAlerts(detected);
                }
            } catch (error) {
                console.error('Error detecting price changes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, [rawMaterialId, tenantId, threshold]);

    if (loading || alerts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert, index) => (
                <Alert
                    key={index}
                    variant={alert.type === 'increase' ? 'destructive' : 'default'}
                    className={alert.type === 'decrease' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                >
                    <div className="flex items-start gap-2">
                        {alert.type === 'increase' ? (
                            <TrendingUp className="h-5 w-5 mt-0.5" />
                        ) : (
                            <TrendingDown className="h-5 w-5 mt-0.5 text-green-600" />
                        )}
                        <div className="flex-1">
                            <AlertTitle className="mb-1">
                                {alert.type === 'increase' ? '📈 Incremento de Precio' : '📉 Precio Reducido'}
                            </AlertTitle>
                            <AlertDescription>
                                <p className="mb-2">{alert.message}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span>
                                        <strong>Proveedor:</strong> {alert.supplier}
                                    </span>
                                    <span>
                                        <strong>Precio actual:</strong> {formatCurrency(alert.currentPrice)}
                                    </span>
                                    <span>
                                        <strong>Precio anterior:</strong> {formatCurrency(alert.previousPrice)}
                                    </span>
                                    <span className="font-mono font-bold">
                                        {alert.percentageChange > 0 ? '+' : ''}
                                        {alert.percentageChange.toFixed(1)}%
                                    </span>
                                </div>
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
}
