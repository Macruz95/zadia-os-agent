/**
 * ZADIA OS - Xero Integration Service
 * Sync invoices, clients, and payments with Xero Accounting
 * 
 * API KEY REQUIRED: XERO_CLIENT_ID, XERO_CLIENT_SECRET
 * Get from: https://developer.xero.com/
 */

import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface XeroConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface XeroTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tenantId: string;
}

interface XeroContact {
  ContactID?: string;
  Name: string;
  EmailAddress?: string;
  Phones?: Array<{
    PhoneType: string;
    PhoneNumber: string;
  }>;
  Addresses?: Array<{
    AddressType: string;
    AddressLine1?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  }>;
  IsCustomer?: boolean;
  IsSupplier?: boolean;
}

interface XeroInvoice {
  InvoiceID?: string;
  InvoiceNumber?: string;
  Type: 'ACCREC' | 'ACCPAY'; // Receivable or Payable
  Contact: { ContactID: string };
  Date: string;
  DueDate: string;
  LineItems: Array<{
    Description: string;
    Quantity: number;
    UnitAmount: number;
    AccountCode?: string;
    TaxType?: string;
  }>;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  Total?: number;
  AmountDue?: number;
}

// ============================================
// Service
// ============================================

export class XeroService {
  private static readonly BASE_URL = 'https://api.xero.com/api.xro/2.0';
  private static readonly AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
  private static readonly TOKEN_URL = 'https://identity.xero.com/connect/token';

  private config: XeroConfig;
  private tokens: XeroTokens | null = null;

  constructor() {
    this.config = {
      clientId: process.env.XERO_CLIENT_ID || '',
      clientSecret: process.env.XERO_CLIENT_SECRET || '',
      redirectUri: process.env.XERO_REDIRECT_URI || ''
    };
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const scopes = 'openid profile email accounting.transactions accounting.contacts offline_access';
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes,
      state
    });

    return `${XeroService.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<XeroTokens> {
    const response = await fetch(XeroService.TOKEN_URL, {
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

    // Get tenant ID from connections
    const tenantId = await this.getTenantId(data.access_token);
    
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      tenantId
    };

    return this.tokens;
  }

  /**
   * Get Xero tenant ID
   */
  private async getTenantId(accessToken: string): Promise<string> {
    const response = await fetch('https://api.xero.com/connections', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Xero connections');
    }

    const connections = await response.json();
    if (!connections.length) {
      throw new Error('No Xero tenants connected');
    }

    return connections[0].tenantId;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(XeroService.TOKEN_URL, {
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
      throw new Error('Not authenticated with Xero');
    }

    // Refresh token if expired
    if (this.tokens.expiresAt < Date.now()) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`${XeroService.BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.tokens.accessToken}`,
        'Xero-Tenant-Id': this.tokens.tenantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Xero API error', new Error(error));
      throw new Error(`Xero API error: ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // Contact Operations
  // ============================================

  async createContact(contact: XeroContact): Promise<XeroContact> {
    const result = await this.apiRequest<{ Contacts: XeroContact[] }>(
      'POST',
      '/Contacts',
      { Contacts: [contact] }
    );
    return result.Contacts[0];
  }

  async getContact(id: string): Promise<XeroContact> {
    const result = await this.apiRequest<{ Contacts: XeroContact[] }>(
      'GET',
      `/Contacts/${id}`
    );
    return result.Contacts[0];
  }

  async getContacts(): Promise<XeroContact[]> {
    const result = await this.apiRequest<{ Contacts: XeroContact[] }>(
      'GET',
      '/Contacts'
    );
    return result.Contacts;
  }

  async updateContact(contact: XeroContact): Promise<XeroContact> {
    const result = await this.apiRequest<{ Contacts: XeroContact[] }>(
      'POST',
      `/Contacts/${contact.ContactID}`,
      { Contacts: [contact] }
    );
    return result.Contacts[0];
  }

  // ============================================
  // Invoice Operations
  // ============================================

  async createInvoice(invoice: XeroInvoice): Promise<XeroInvoice> {
    const result = await this.apiRequest<{ Invoices: XeroInvoice[] }>(
      'POST',
      '/Invoices',
      { Invoices: [invoice] }
    );
    return result.Invoices[0];
  }

  async getInvoice(id: string): Promise<XeroInvoice> {
    const result = await this.apiRequest<{ Invoices: XeroInvoice[] }>(
      'GET',
      `/Invoices/${id}`
    );
    return result.Invoices[0];
  }

  async getInvoices(status?: string): Promise<XeroInvoice[]> {
    const endpoint = status 
      ? `/Invoices?where=Status=="${status}"` 
      : '/Invoices';
    const result = await this.apiRequest<{ Invoices: XeroInvoice[] }>(
      'GET',
      endpoint
    );
    return result.Invoices;
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    await this.apiRequest(
      'POST',
      `/Invoices/${invoiceId}/Email`,
      {}
    );
  }

  // ============================================
  // Sync Operations
  // ============================================

  /**
   * Sync ZADIA clients to Xero
   */
  async syncClientsToXero(clients: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    xeroId?: string;
  }>): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();

    for (const client of clients) {
      try {
        const xeroContact: XeroContact = {
          Name: client.name,
          EmailAddress: client.email,
          IsCustomer: true,
          Phones: client.phone ? [{
            PhoneType: 'DEFAULT',
            PhoneNumber: client.phone
          }] : undefined,
          Addresses: client.address ? [{
            AddressType: 'POBOX',
            AddressLine1: client.address,
            City: client.city,
            Region: client.state,
            PostalCode: client.postalCode,
            Country: client.country
          }] : undefined
        };

        if (client.xeroId) {
          xeroContact.ContactID = client.xeroId;
          await this.updateContact(xeroContact);
          mapping.set(client.id, client.xeroId);
        } else {
          const created = await this.createContact(xeroContact);
          if (created.ContactID) {
            mapping.set(client.id, created.ContactID);
          }
        }
      } catch (error) {
        logger.error('Failed to sync client to Xero', error as Error, {
          component: 'XeroService',
          metadata: { clientId: client.id }
        });
      }
    }

    return mapping;
  }

  /**
   * Import contacts from Xero to ZADIA
   */
  async importContactsFromXero(): Promise<Array<{
    xeroId: string;
    name: string;
    email?: string;
    phone?: string;
  }>> {
    const contacts = await this.getContacts();
    
    return contacts
      .filter(c => c.IsCustomer)
      .map(contact => ({
        xeroId: contact.ContactID!,
        name: contact.Name,
        email: contact.EmailAddress,
        phone: contact.Phones?.[0]?.PhoneNumber
      }));
  }
}

export default XeroService;
