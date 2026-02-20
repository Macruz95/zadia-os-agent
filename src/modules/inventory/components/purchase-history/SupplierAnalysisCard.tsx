'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { PurchaseHistory, SupplierPriceAnalysis, SupplierComparison } from '../../types/inventory-extended.types';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { PurchasePriceAnalysisService } from '../../services/purchase-price-analysis.service';
import { useTenantId } from '@/contexts/TenantContext';
import { formatCurrency } from '@/lib/utils';

interface SupplierAnalysisCardProps {
    rawMaterialId: string;
}

export function SupplierAnalysisCard({ rawMaterialId }: SupplierAnalysisCardProps) {
    const [analyses, setAnalyses] = useState<SupplierPriceAnalysis[]>([]);
    const [comparisons, setComparisons] = useState<SupplierComparison[]>([]);
    const [loading, setLoading] = useState(true);
    const tenantId = useTenantId();

    useEffect(() => {
        if (!tenantId || !rawMaterialId) return;

        const loadAnalysis = async () => {
            try {
                setLoading(true);
                const history = await PurchaseHistoryService.getPurchaseHistory(
                    rawMaterialId,
                    tenantId,
                    100
                );

                if (history.length > 0) {
                    const analyzed = PurchasePriceAnalysisService.analyzePricesBySupplier(history);
                    const compared = PurchasePriceAnalysisService.compareSuppliers(analyzed);

                    setAnalyses(analyzed);
                    setComparisons(compared);
                }
            } catch (error) {
                console.error('Error analyzing suppliers:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAnalysis();
    }, [rawMaterialId, tenantId]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Análisis de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (comparisons.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Análisis de Proveedores</CardTitle>
                    <CardDescription>
                        No hay suficientes datos para análisis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Necesitas al menos 2 compras de diferentes proveedores para ver el análisis.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getRecommendationIcon = (rec: string) => {
        switch (rec) {
            case 'best_price':
                return <Award className="h-4 w-4 text-yellow-500" />;
            case 'frequent':
                return <TrendingUp className="h-4 w-4 text-blue-500" />;
            case 'expensive':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getRecommendationLabel = (rec: string) => {
        switch (rec) {
            case 'best_price':
                return 'Más Barato';
            case 'frequent':
                return 'Frecuente';
            case 'recent':
                return 'Reciente';
            case 'expensive':
                return 'Costoso';
            default:
                return '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis de Proveedores</CardTitle>
                <CardDescription>
                    Comparación de precios y recomendaciones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {comparisons.map((comparison) => {
                        const analysis = analyses.find(a => a.supplier === comparison.supplier);
                        const isTopRanked = comparison.rank <= 2;

                        return (
                            <div
                                key={comparison.supplier}
                                className={`flex items-center justify-between p-4 border rounded-lg ${isTopRanked ? 'border-primary bg-primary/5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                        <span className="text-sm font-bold">#{comparison.rank}</span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{comparison.supplier}</p>
                                            {getRecommendationIcon(comparison.recommendation)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {comparison.purchaseCount} compras
                                            {analysis && ` • ${analysis.totalQuantityBought.toFixed(0)} unidades totales`}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end mb-1">
                                        <p className="text-lg font-bold font-mono">
                                            {formatCurrency(comparison.averagePrice)}
                                        </p>
                                        <Badge
                                            variant={comparison.recommendation === 'best_price' ? 'default' : 'outline'}
                                        >
                                            {getRecommendationLabel(comparison.recommendation)}
                                        </Badge>
                                    </div>

                                    {analysis && analysis.priceVariation > 5 && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                            Variación: {analysis.priceVariation.toFixed(1)}%
                                            {analysis.lastPrice > analysis.lowestPrice && <TrendingUp className="h-3 w-3 text-orange-500" />}
                                            {analysis.lastPrice < analysis.highestPrice && <TrendingDown className="h-3 w-3 text-green-500" />}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {comparisons.length > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>💡 Recomendación:</strong> {comparisons[0].supplier} ofrece el mejor precio promedio
                            ({formatCurrency(comparisons[0].averagePrice)}).
                            {comparisons.length > 1 && comparisons[1] && (
                                <span>
                                    {' '}Ahorro estimado: {formatCurrency(comparisons[1].averagePrice - comparisons[0].averagePrice)} por unidad.
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
