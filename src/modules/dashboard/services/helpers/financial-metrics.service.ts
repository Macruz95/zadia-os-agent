import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export async function getFinancialMetrics(tenantId: string) {
    try {
        if (!tenantId) {
            return {
                monthlyRevenue: 0,
                monthlyExpenses: 0,
                netProfit: 0,
                revenueGrowth: 0,
                expenseGrowth: 0
            };
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Revenue (Paid Invoices)
        // Current Month
        const currentInvoices = await InvoicesService.searchInvoices({
            tenantId,
            startDate: startOfMonth,
            endDate: now,
            status: 'paid'
        });
        const monthlyRevenue = currentInvoices.reduce((sum, inv) => sum + inv.total, 0);

        // Previous Month
        const prevInvoices = await InvoicesService.searchInvoices({
            tenantId,
            startDate: startOfPrevMonth,
            endDate: endOfPrevMonth,
            status: 'paid'
        });
        const prevRevenue = prevInvoices.reduce((sum, inv) => sum + inv.total, 0);

        const revenueGrowth = prevRevenue === 0 ? 100 : ((monthlyRevenue - prevRevenue) / prevRevenue) * 100;

        // 2. Expenses (Project Expenses)
        const expensesRef = collection(db, 'projectExpenses');

        // Current Month Expenses with tenantId filter
        const currentExpensesQuery = query(
            expensesRef,
            where('tenantId', '==', tenantId),
            where('date', '>=', Timestamp.fromDate(startOfMonth)),
            where('date', '<=', Timestamp.fromDate(now))
        );
        const currentExpensesSnap = await getDocs(currentExpensesQuery);
        const monthlyExpenses = currentExpensesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        // Previous Month Expenses with tenantId filter
        const prevExpensesQuery = query(
            expensesRef,
            where('tenantId', '==', tenantId),
            where('date', '>=', Timestamp.fromDate(startOfPrevMonth)),
            where('date', '<=', Timestamp.fromDate(endOfPrevMonth))
        );
        const prevExpensesSnap = await getDocs(prevExpensesQuery);
        const prevExpenses = prevExpensesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        const expenseGrowth = prevExpenses === 0 ? 100 : ((monthlyExpenses - prevExpenses) / prevExpenses) * 100;

        // 3. Net Profit
        const netProfit = monthlyRevenue - monthlyExpenses;

        return {
            monthlyRevenue,
            monthlyExpenses,
            netProfit,
            revenueGrowth,
            expenseGrowth
        };
    } catch (error) {
        logger.error('Error calculating financial metrics', error as Error);
        return {
            monthlyRevenue: 0,
            monthlyExpenses: 0,
            netProfit: 0,
            revenueGrowth: 0,
            expenseGrowth: 0
        };
    }
}
