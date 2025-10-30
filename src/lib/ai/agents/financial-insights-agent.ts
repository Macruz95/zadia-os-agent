/**
 * ZADIA OS - Financial Insights Agent
 * 
 * Analyzes financial KPIs and generates actionable insights
 * Part of the Agentic Layer
 */

import { BaseAgent, AgentExecutionResult } from './base-agent';

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
  cashFlow?: number;
  pendingInvoices?: number;
  activeOpportunities?: number;
}

export class FinancialInsightsAgent extends BaseAgent {
  constructor() {
    super(
      'FinancialInsightsAgent',
      `Eres un CFO virtual experto de ZADIA OS.
Tu trabajo es analizar métricas financieras y proporcionar insights estratégicos en español.

FORMATO DE RESPUESTA:
1. [Tendencia principal] - Describe la tendencia en una línea
2. [Riesgo u oportunidad] - Identifica el punto crítico
3. [Acción recomendada] - Sugiere un paso concreto

Sé conciso, específico y enfocado en resultados accionables.
Usa números exactos cuando los tengas disponibles.`
    );
  }

  async analyze(
    data: Record<string, unknown>
  ): Promise<AgentExecutionResult> {
    try {
      const metrics = data as unknown as FinancialMetrics;

      // Build analysis prompt
      const prompt = this.buildFinancialPrompt(metrics);

      // Get AI insights
      const aiResponse = await this.askAI(prompt);

      // Parse insights
      const insights = this.parseInsights(aiResponse);

      // Extract actions
      const actions = this.extractActions(aiResponse);

      // Calculate health indicators
      const healthIndicators = this.calculateHealthIndicators(metrics);

      return {
        success: true,
        insights,
        actions,
        data: {
          aiAnalysis: aiResponse,
          healthIndicators,
          metrics
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        insights: []
      };
    }
  }

  /**
   * Build detailed financial analysis prompt
   */
  private buildFinancialPrompt(metrics: FinancialMetrics): string {
    const profitMargin = metrics.revenue > 0 
      ? ((metrics.profit / metrics.revenue) * 100).toFixed(1)
      : '0.0';

    let prompt = `Analiza estos datos financieros del mes actual:

- Ingresos: ${this.formatCurrency(metrics.revenue)}
- Egresos: ${this.formatCurrency(metrics.expenses)}
- Beneficio Neto: ${this.formatCurrency(metrics.profit)}
- Margen de Beneficio: ${profitMargin}%`;

    if (metrics.monthlyRevenue && metrics.monthlyRevenue.length > 0) {
      const lastMonths = metrics.monthlyRevenue.slice(-3);
      const trend = this.calculateTrend(lastMonths.map(m => m.revenue));
      
      prompt += `\n\nTendencia últimos 3 meses: ${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
      prompt += `\nIngresos mensuales: ${lastMonths.map(m => `${m.month}: ${this.formatCurrency(m.revenue)}`).join(', ')}`;
    }

    if (metrics.cashFlow !== undefined) {
      prompt += `\n\nFlujo de Caja: ${this.formatCurrency(metrics.cashFlow)}`;
    }

    if (metrics.pendingInvoices !== undefined && metrics.pendingInvoices > 0) {
      prompt += `\n\n⚠️ Facturas Pendientes de Cobro: ${metrics.pendingInvoices}`;
    }

    if (metrics.activeOpportunities !== undefined) {
      prompt += `\nOportunidades Activas en Pipeline: ${metrics.activeOpportunities}`;
    }

    prompt += `\n\nProporciona 3 insights estratégicos clave.`;

    return prompt;
  }

  /**
   * Calculate health indicators
   */
  private calculateHealthIndicators(metrics: FinancialMetrics) {
    const profitMargin = metrics.revenue > 0 
      ? (metrics.profit / metrics.revenue) * 100
      : 0;

    return {
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      isProfitable: metrics.profit > 0,
      revenueGrowth: this.calculateRevenueGrowth(metrics.monthlyRevenue),
      cashFlowHealth: this.assessCashFlow(metrics.cashFlow),
      overallHealth: this.calculateOverallHealth(metrics)
    };
  }

  /**
   * Calculate revenue growth trend
   */
  private calculateRevenueGrowth(monthlyRevenue?: Array<{ month: string; revenue: number }>): number {
    if (!monthlyRevenue || monthlyRevenue.length < 2) return 0;

    const recent = monthlyRevenue.slice(-3);
    return this.calculateTrend(recent.map(m => m.revenue));
  }

  /**
   * Calculate trend percentage
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0] || 1;
    const last = values[values.length - 1] || 0;

    return ((last - first) / first) * 100;
  }

  /**
   * Assess cash flow health
   */
  private assessCashFlow(cashFlow?: number): 'healthy' | 'warning' | 'critical' {
    if (cashFlow === undefined) return 'warning';
    if (cashFlow > 10000) return 'healthy';
    if (cashFlow > 0) return 'warning';
    return 'critical';
  }

  /**
   * Calculate overall financial health score (0-100)
   */
  private calculateOverallHealth(metrics: FinancialMetrics): number {
    let score = 50; // Base score

    // Profitability (40 points max)
    if (metrics.profit > 0) {
      const profitMargin = (metrics.profit / metrics.revenue) * 100;
      score += Math.min(40, profitMargin * 2);
    } else {
      score -= 20; // Penalty for losses
    }

    // Revenue trend (30 points max)
    if (metrics.monthlyRevenue && metrics.monthlyRevenue.length >= 2) {
      const growth = this.calculateRevenueGrowth(metrics.monthlyRevenue);
      score += Math.min(30, growth);
    }

    // Cash flow (20 points max)
    if (metrics.cashFlow !== undefined) {
      if (metrics.cashFlow > 0) score += 20;
      else score -= 10;
    }

    // Pending invoices (penalty)
    if (metrics.pendingInvoices && metrics.pendingInvoices > 5) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
