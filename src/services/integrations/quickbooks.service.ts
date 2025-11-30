/**
 * ZADIA OS - QuickBooks Integration Service
 * Sync invoices, clients, and payments with QuickBooks Online
 * 
 * API KEY REQUIRED: QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET
 * Get from: https://developer.intuit.com/
 */

import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
}

interface QuickBooksTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  realmId: string;
}

interface QuickBooksCustomer {
  Id?: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
}

interface QuickBooksInvoice {
  Id?: string;
  DocNumber?: string;
  TxnDate: string;
  DueDate: string;
  CustomerRef: { value: string };
  Line: Array<{
    Amount: number;
    Description?: string;
    DetailType: string;
    SalesItemLineDetail?: {
      ItemRef: { value: string };
      Qty: number;
      UnitPrice: number;
    };
  }>;
  TotalAmt?: number;
}

// ============================================
// Service
// ============================================

export class QuickBooksService {
  private static readonly BASE_URL_SANDBOX = 'https://sandbox-quickbooks.api.intuit.com';
  private static readonly BASE_URL_PRODUCTION = 'https://quickbooks.api.intuit.com';
  private static readonly AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';

  private config: QuickBooksConfig;
  private tokens: QuickBooksTokens | null = null;

  constructor() {
    this.config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || '',
      environment: (process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };
  }

  private get baseUrl(): string {
    return this.config.environment === 'production' 
      ? QuickBooksService.BASE_URL_PRODUCTION 
      : QuickBooksService.BASE_URL_SANDBOX;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const scopes = 'com.intuit.quickbooks.accounting openid profile email';
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes,
      state
    });

    return `${QuickBooksService.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, realmId: string): Promise<QuickBooksTokens> {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.status}`);
    }

    const data = await response.json();
    
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      realmId
    };

    return this.tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    
    this.tokens = {
      ...this.tokens,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000)
    };
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    if (!this.tokens) {
      throw new Error('Not authenticated with QuickBooks');
    }

    // Refresh token if expired
    if (this.tokens.expiresAt < Date.now()) {
      await this.refreshAccessToken();
    }

    const url = `${this.baseUrl}/v3/company/${this.tokens.realmId}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.tokens.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('QuickBooks API error', new Error(error));
      throw new Error(`QuickBooks API error: ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // Customer Operations
  // ============================================

  async createCustomer(customer: QuickBooksCustomer): Promise<QuickBooksCustomer> {
    const result = await this.apiRequest<{ Customer: QuickBooksCustomer }>(
      'POST',
      '/customer',
      customer
    );
    return result.Customer;
  }

  async getCustomer(id: string): Promise<QuickBooksCustomer> {
    const result = await this.apiRequest<{ Customer: QuickBooksCustomer }>(
      'GET',
      `/customer/${id}`
    );
    return result.Customer;
  }

  async updateCustomer(customer: QuickBooksCustomer): Promise<QuickBooksCustomer> {
    const result = await this.apiRequest<{ Customer: QuickBooksCustomer }>(
      'POST',
      '/customer',
      customer
    );
    return result.Customer;
  }

  async queryCustomers(query?: string): Promise<QuickBooksCustomer[]> {
    const sqlQuery = query || "SELECT * FROM Customer MAXRESULTS 1000";
    const result = await this.apiRequest<{ QueryResponse: { Customer: QuickBooksCustomer[] } }>(
      'GET',
      `/query?query=${encodeURIComponent(sqlQuery)}`
    );
    return result.QueryResponse.Customer || [];
  }

  // ============================================
  // Invoice Operations
  // ============================================

  async createInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice> {
    const result = await this.apiRequest<{ Invoice: QuickBooksInvoice }>(
      'POST',
      '/invoice',
      invoice
    );
    return result.Invoice;
  }

  async getInvoice(id: string): Promise<QuickBooksInvoice> {
    const result = await this.apiRequest<{ Invoice: QuickBooksInvoice }>(
      'GET',
      `/invoice/${id}`
    );
    return result.Invoice;
  }

  async queryInvoices(query?: string): Promise<QuickBooksInvoice[]> {
    const sqlQuery = query || "SELECT * FROM Invoice MAXRESULTS 1000";
    const result = await this.apiRequest<{ QueryResponse: { Invoice: QuickBooksInvoice[] } }>(
      'GET',
      `/query?query=${encodeURIComponent(sqlQuery)}`
    );
    return result.QueryResponse.Invoice || [];
  }

  async sendInvoice(invoiceId: string, email: string): Promise<void> {
    await this.apiRequest(
      'POST',
      `/invoice/${invoiceId}/send?sendTo=${encodeURIComponent(email)}`,
      {}
    );
  }

  // ============================================
  // Sync Operations
  // ============================================

  /**
   * Sync ZADIA clients to QuickBooks
   */
  async syncClientsToQuickBooks(clients: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    quickbooksId?: string;
  }>): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();

    for (const client of clients) {
      try {
        const qbCustomer: QuickBooksCustomer = {
          DisplayName: client.name,
          CompanyName: client.company,
          PrimaryEmailAddr: client.email ? { Address: client.email } : undefined,
          PrimaryPhone: client.phone ? { FreeFormNumber: client.phone } : undefined,
          BillAddr: client.address ? {
            Line1: client.address,
            City: client.city,
            CountrySubDivisionCode: client.state,
            PostalCode: client.postalCode,
            Country: client.country
          } : undefined
        };

        if (client.quickbooksId) {
          qbCustomer.Id = client.quickbooksId;
          await this.updateCustomer(qbCustomer);
          mapping.set(client.id, client.quickbooksId);
        } else {
          const created = await this.createCustomer(qbCustomer);
          if (created.Id) {
            mapping.set(client.id, created.Id);
          }
        }
      } catch (error) {
        logger.error('Failed to sync client to QuickBooks', error as Error, {
          component: 'QuickBooksService',
          metadata: { clientId: client.id }
        });
      }
    }

    return mapping;
  }

  /**
   * Import customers from QuickBooks to ZADIA
   */
  async importCustomersFromQuickBooks(): Promise<Array<{
    quickbooksId: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  }>> {
    const customers = await this.queryCustomers();
    
    return customers.map(customer => ({
      quickbooksId: customer.Id!,
      name: customer.DisplayName,
      email: customer.PrimaryEmailAddr?.Address,
      phone: customer.PrimaryPhone?.FreeFormNumber,
      company: customer.CompanyName
    }));
  }
}

export default QuickBooksService;
