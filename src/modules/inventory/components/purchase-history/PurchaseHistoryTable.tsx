'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseHistory } from '../../types/inventory-extended.types';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { useTenantId } from '@/contexts/TenantContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface PurchaseHistoryTableProps {
    rawMaterialId: string;
    limit?: number;
}

export function PurchaseHistoryTable({ rawMaterialId, limit = 20 }: PurchaseHistoryTableProps) {
    const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const tenantId = useTenantId();

    useEffect(() => {
        if (!tenantId || !rawMaterialId) return;

        const loadHistory = async () => {
            try {
                setLoading(true);
                const history = await PurchaseHistoryService.getPurchaseHistory(
                    rawMaterialId,
                    tenantId,
                    limit
                );
                setPurchases(history);
            } catch (error) {
                logger.error('Error loading purchase history', error instanceof Error ? error : new Error(String(error)));
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [rawMaterialId, tenantId, limit]);

    const calculatePriceChange = (index: number): number | null => {
        if (index >= purchases.length - 1) return null;
        const current = purchases[index];
        const previous = purchases[index + 1];

        if (current.supplier !== previous.supplier) return null;

        return ((current.unitCost - previous.unitCost) / previous.unitCost) * 100;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (purchases.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        No hay historial de compras para este material.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Compras ({purchases.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Factura</TableHead>
                                <TableHead className="text-right">Variación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.map((purchase, index) => {
                                const priceChange = calculatePriceChange(index);

                                return (
                                    <TableRow key={purchase.id}>
                                        <TableCell className="font-medium">
                                            {formatDate(purchase.purchaseDate)}
                                        </TableCell>
                                        <TableCell>{purchase.supplier}</TableCell>
                                        <TableCell className="text-right">
                                            {purchase.quantity} {purchase.unitOfMeasure}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(purchase.unitCost)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold">
                                            {formatCurrency(purchase.totalCost)}
                                        </TableCell>
                                        <TableCell>
                                            {purchase.invoiceNumber || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {priceChange !== null ? (
                                                <Badge
                                                    variant={priceChange > 0 ? 'destructive' : 'secondary'}
                                                    className="font-mono"
                                                >
                                                    {priceChange > 0 ? '+' : ''}
                                                    {priceChange.toFixed(1)}%
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
