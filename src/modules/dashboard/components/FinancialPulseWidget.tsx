/**
 * ZADIA OS - Financial Pulse Widget
 * 
 * Muestra métricas financieras clave de un vistazo
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinancialPulseWidgetProps {
    metrics?: {
        monthlyRevenue: number;
        monthlyExpenses: number;
        netProfit: number;
        revenueGrowth: number;
        expenseGrowth: number;
    };
    loading?: boolean;
}

export function FinancialPulseWidget({ metrics, loading }: FinancialPulseWidgetProps) {
    if (loading || !metrics) {
        return <div className="grid gap-4 md:grid-cols-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>;
    }

    const cards = [
        {
            title: 'Ingresos (Mes)',
            value: metrics.monthlyRevenue,
            growth: metrics.revenueGrowth,
            icon: DollarSign,
            color: 'text-green-600',
        },
        {
            title: 'Gastos (Mes)',
            value: metrics.monthlyExpenses,
            growth: metrics.expenseGrowth,
            icon: CreditCard,
            color: 'text-red-600',
            inverseGrowth: true, // Growth is bad for expenses
        },
        {
            title: 'Beneficio Neto',
            value: metrics.netProfit,
            growth: null, // Net profit growth logic can be complex
            icon: Wallet,
            color: 'text-blue-600',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card, idx) => (
                <Card key={idx}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(card.value)}
                        </div>
                        {card.growth !== null && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                {card.growth > 0 ? (
                                    <TrendingUp className={`h-3 w-3 mr-1 ${card.inverseGrowth ? 'text-red-500' : 'text-green-500'}`} />
                                ) : (
                                    <TrendingDown className={`h-3 w-3 mr-1 ${card.inverseGrowth ? 'text-green-500' : 'text-red-500'}`} />
                                )}
                                <span className={
                                    card.growth > 0
                                        ? (card.inverseGrowth ? 'text-red-500' : 'text-green-500')
                                        : (card.inverseGrowth ? 'text-green-500' : 'text-red-500')
                                }>
                                    {Math.abs(card.growth)}%
                                </span>
                                <span className="ml-1">vs mes anterior</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
