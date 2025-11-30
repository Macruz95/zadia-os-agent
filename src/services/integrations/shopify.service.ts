/**
 * ZADIA OS - Shopify Integration Service
 * Sync products, inventory, and orders with Shopify
 * 
 * API KEY REQUIRED: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_STORE_DOMAIN
 * Get from: https://partners.shopify.com/
 */

import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface ShopifyConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  storeDomain: string; // mystore.myshopify.com
}

interface ShopifyProduct {
  id?: number;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  status?: 'active' | 'archived' | 'draft';
  variants: Array<{
    id?: number;
    title: string;
    price: string;
    sku?: string;
    inventory_quantity?: number;
    inventory_management?: 'shopify' | null;
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
}

interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
}

interface ShopifyOrder {
  id?: number;
  order_number?: number;
  email: string;
  created_at?: string;
  total_price: string;
  financial_status?: 'pending' | 'paid' | 'refunded' | 'voided';
  fulfillment_status?: 'fulfilled' | 'partial' | null;
  line_items: Array<{
    product_id: number;
    variant_id: number;
    quantity: number;
    price: string;
  }>;
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface ShopifyCustomer {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  addresses?: Array<{
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  }>;
  orders_count?: number;
  total_spent?: string;
}

// ============================================
// Service
// ============================================

export class ShopifyService {
  private config: ShopifyConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SHOPIFY_API_KEY || '',
      apiSecret: process.env.SHOPIFY_API_SECRET || '',
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN || ''
    };
  }

  private get baseUrl(): string {
    return `https://${this.config.storeDomain}/admin/api/2024-01`;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(redirectUri: string, state: string): string {
    const scopes = 'read_products,write_products,read_inventory,write_inventory,read_orders,read_customers';
    const params = new URLSearchParams({
      client_id: this.config.apiKey,
      redirect_uri: redirectUri,
      scope: scopes,
      state
    });

    return `https://${this.config.storeDomain}/admin/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(`https://${this.config.storeDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret,
        code
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.status}`);
    }

    const data = await response.json();
    this.config.accessToken = data.access_token;
    return data.access_token;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    if (!this.config.accessToken) {
      throw new Error('Not authenticated with Shopify');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Shopify API error', new Error(error));
      throw new Error(`Shopify API error: ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // Product Operations
  // ============================================

  async createProduct(product: ShopifyProduct): Promise<ShopifyProduct> {
    const result = await this.apiRequest<{ product: ShopifyProduct }>(
      'POST',
      '/products.json',
      { product }
    );
    return result.product;
  }

  async getProduct(id: number): Promise<ShopifyProduct> {
    const result = await this.apiRequest<{ product: ShopifyProduct }>(
      'GET',
      `/products/${id}.json`
    );
    return result.product;
  }

  async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    const result = await this.apiRequest<{ products: ShopifyProduct[] }>(
      'GET',
      `/products.json?limit=${limit}`
    );
    return result.products;
  }

  async updateProduct(product: ShopifyProduct): Promise<ShopifyProduct> {
    const result = await this.apiRequest<{ product: ShopifyProduct }>(
      'PUT',
      `/products/${product.id}.json`,
      { product }
    );
    return result.product;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.apiRequest('DELETE', `/products/${id}.json`);
  }

  // ============================================
  // Inventory Operations
  // ============================================

  async getInventoryLevels(locationId: number): Promise<ShopifyInventoryLevel[]> {
    const result = await this.apiRequest<{ inventory_levels: ShopifyInventoryLevel[] }>(
      'GET',
      `/inventory_levels.json?location_ids=${locationId}`
    );
    return result.inventory_levels;
  }

  async adjustInventory(
    inventoryItemId: number,
    locationId: number,
    adjustment: number
  ): Promise<ShopifyInventoryLevel> {
    const result = await this.apiRequest<{ inventory_level: ShopifyInventoryLevel }>(
      'POST',
      '/inventory_levels/adjust.json',
      {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available_adjustment: adjustment
      }
    );
    return result.inventory_level;
  }

  async setInventory(
    inventoryItemId: number,
    locationId: number,
    available: number
  ): Promise<ShopifyInventoryLevel> {
    const result = await this.apiRequest<{ inventory_level: ShopifyInventoryLevel }>(
      'POST',
      '/inventory_levels/set.json',
      {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available
      }
    );
    return result.inventory_level;
  }

  // ============================================
  // Order Operations
  // ============================================

  async getOrders(status?: string): Promise<ShopifyOrder[]> {
    const endpoint = status 
      ? `/orders.json?status=${status}` 
      : '/orders.json';
    const result = await this.apiRequest<{ orders: ShopifyOrder[] }>(
      'GET',
      endpoint
    );
    return result.orders;
  }

  async getOrder(id: number): Promise<ShopifyOrder> {
    const result = await this.apiRequest<{ order: ShopifyOrder }>(
      'GET',
      `/orders/${id}.json`
    );
    return result.order;
  }

  // ============================================
  // Customer Operations
  // ============================================

  async getCustomers(limit = 250): Promise<ShopifyCustomer[]> {
    const result = await this.apiRequest<{ customers: ShopifyCustomer[] }>(
      'GET',
      `/customers.json?limit=${limit}`
    );
    return result.customers;
  }

  async getCustomer(id: number): Promise<ShopifyCustomer> {
    const result = await this.apiRequest<{ customer: ShopifyCustomer }>(
      'GET',
      `/customers/${id}.json`
    );
    return result.customer;
  }

  // ============================================
  // Sync Operations
  // ============================================

  /**
   * Sync ZADIA products to Shopify
   */
  async syncProductsToShopify(products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    sku?: string;
    quantity?: number;
    category?: string;
    shopifyId?: number;
  }>): Promise<Map<string, number>> {
    const mapping = new Map<string, number>();

    for (const product of products) {
      try {
        const shopifyProduct: ShopifyProduct = {
          title: product.name,
          body_html: product.description,
          product_type: product.category,
          status: 'active',
          variants: [{
            title: 'Default',
            price: product.price.toString(),
            sku: product.sku,
            inventory_quantity: product.quantity,
            inventory_management: 'shopify'
          }]
        };

        if (product.shopifyId) {
          shopifyProduct.id = product.shopifyId;
          await this.updateProduct(shopifyProduct);
          mapping.set(product.id, product.shopifyId);
        } else {
          const created = await this.createProduct(shopifyProduct);
          if (created.id) {
            mapping.set(product.id, created.id);
          }
        }
      } catch (error) {
        logger.error('Failed to sync product to Shopify', error as Error, {
          component: 'ShopifyService',
          metadata: { productId: product.id }
        });
      }
    }

    return mapping;
  }

  /**
   * Import products from Shopify to ZADIA
   */
  async importProductsFromShopify(): Promise<Array<{
    shopifyId: number;
    name: string;
    description?: string;
    price: number;
    sku?: string;
    quantity?: number;
    category?: string;
  }>> {
    const products = await this.getProducts();
    
    return products.map(product => ({
      shopifyId: product.id!,
      name: product.title,
      description: product.body_html?.replace(/<[^>]*>/g, ''),
      price: parseFloat(product.variants[0]?.price || '0'),
      sku: product.variants[0]?.sku,
      quantity: product.variants[0]?.inventory_quantity,
      category: product.product_type
    }));
  }

  /**
   * Sync inventory levels from ZADIA to Shopify
   */
  async syncInventoryToShopify(
    items: Array<{
      shopifyVariantId: number;
      inventoryItemId: number;
      quantity: number;
    }>,
    locationId: number
  ): Promise<void> {
    for (const item of items) {
      try {
        await this.setInventory(item.inventoryItemId, locationId, item.quantity);
      } catch (error) {
        logger.error('Failed to sync inventory to Shopify', error as Error, {
          component: 'ShopifyService',
          metadata: { variantId: item.shopifyVariantId }
        });
      }
    }
  }
}

export default ShopifyService;
