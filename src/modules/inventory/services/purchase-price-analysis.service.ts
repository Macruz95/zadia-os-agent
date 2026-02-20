/**
 * ZADIA OS - Purchase Price Analysis Service
 * 
 * Analiza precios de compras y proveedores
 */

import { PurchaseHistory, SupplierPriceAnalysis, PriceAlert, SupplierComparison } from '../types/inventory-extended.types';

export class PurchasePriceAnalysisService {

    /**
     * Analizar precios por proveedor
     */
    static analyzePricesBySupplier(
        purchases: PurchaseHistory[]
    ): SupplierPriceAnalysis[] {
        const supplierMap = new Map<string, PurchaseHistory[]>();

        // Agrupar por proveedor
        purchases.forEach(p => {
            const existing = supplierMap.get(p.supplier) || [];
            existing.push(p);
            supplierMap.set(p.supplier, existing);
        });

        // Calcular estadísticas por proveedor
        const analyses: SupplierPriceAnalysis[] = [];

        supplierMap.forEach((supplierPurchases, supplier) => {
            const prices = supplierPurchases.map(p => p.unitCost);
            const quantities = supplierPurchases.map(p => p.quantity);

            const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const lastPrice = supplierPurchases[0].unitCost; // Ya está ordenado desc
            const lowestPrice = Math.min(...prices);
            const highestPrice = Math.max(...prices);
            const priceVariation = ((highestPrice - lowestPrice) / lowestPrice) * 100;
            const totalQuantityBought = quantities.reduce((a, b) => a + b, 0);

            analyses.push({
                supplier,
                purchaseCount: supplierPurchases.length,
                averagePrice,
                lastPrice,
                lowestPrice,
                highestPrice,
                priceVariation,
                lastPurchaseDate: supplierPurchases[0].purchaseDate,
                totalQuantityBought,
            });
        });

        return analyses.sort((a, b) => a.averagePrice - b.averagePrice);
    }

    /**
     * Detectar cambios significativos de precio
     */
    static detectPriceChanges(
        purchases: PurchaseHistory[],
        threshold: number = 10 // % de variación
    ): PriceAlert[] {
        const alerts: PriceAlert[] = [];

        if (purchases.length < 2) return alerts;

        // Comparar últimas compras
        for (let i = 0; i < purchases.length - 1; i++) {
            const current = purchases[i];
            const previous = purchases[i + 1];

            // Solo comparar mismo proveedor
            if (current.supplier !== previous.supplier) continue;

            const percentageChange = ((current.unitCost - previous.unitCost) / previous.unitCost) * 100;

            if (Math.abs(percentageChange) >= threshold) {
                const type = percentageChange > 0 ? 'increase' : 'decrease';
                const message = type === 'increase'
                    ? `Precio subió ${percentageChange.toFixed(1)}% vs última compra`
                    : `Precio bajó ${Math.abs(percentageChange).toFixed(1)}% vs última compra`;

                alerts.push({
                    type,
                    currentPrice: current.unitCost,
                    previousPrice: previous.unitCost,
                    percentageChange,
                    supplier: current.supplier,
                    purchaseDate: current.purchaseDate,
                    message,
                });
            }
        }

        return alerts;
    }

    /**
     * Comparar proveedores y recomendar
     */
    static compareSuppliers(
        analyses: SupplierPriceAnalysis[]
    ): SupplierComparison[] {
        if (analyses.length === 0) return [];

        // Ordenar por precio promedio
        const sorted = [...analyses].sort((a, b) => a.averagePrice - b.averagePrice);

        return sorted.map((analysis, index) => {
            let recommendation: SupplierComparison['recommendation'] = 'expensive';

            if (index === 0) {
                recommendation = 'best_price'; // El más barato
            } else if (analysis.purchaseCount >= 5) {
                recommendation = 'frequent'; // Compras frecuentes
            } else if (index < sorted.length / 2) {
                recommendation = 'recent'; // Precio razonable
            }

            return {
                rank: index + 1,
                supplier: analysis.supplier,
                averagePrice: analysis.averagePrice,
                lastPrice: analysis.lastPrice,
                purchaseCount: analysis.purchaseCount,
                recommendation,
            };
        });
    }

    /**
     * Calcular precio promedio histórico
     */
    static calculateAveragePrice(purchases: PurchaseHistory[]): number {
        if (purchases.length === 0) return 0;
        const total = purchases.reduce((sum, p) => sum + p.unitCost, 0);
        return total / purchases.length;
    }

    /**
     * Obtener mejor proveedor (más barato)
     */
    static getBestSupplier(analyses: SupplierPriceAnalysis[]): SupplierPriceAnalysis | null {
        if (analyses.length === 0) return null;
        return analyses.reduce((best, current) =>
            current.averagePrice < best.averagePrice ? current : best
        );
    }
}
