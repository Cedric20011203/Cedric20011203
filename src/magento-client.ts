import axios, { AxiosInstance, AxiosError } from 'axios';

export interface MagentoConfig {
  baseUrl: string;
  accessToken: string;
  timeout?: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  type_id: string;
  attribute_set_id: number;
  custom_attributes?: Array<{ attribute_code: string; value: any }>;
}

export interface Customer {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  created_at: string;
  group_id: number;
}

export interface Order {
  entity_id: number;
  increment_id: string;
  customer_email: string;
  status: string;
  created_at: string;
  grand_total: number;
  items?: Array<any>;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number;
  is_active: boolean;
  level: number;
  children_data?: Category[];
}

export class MagentoClient {
  private client: AxiosInstance;

  constructor(config: MagentoConfig) {
    this.client = axios.create({
      baseURL: `${config.baseUrl}/rest/V1`,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add error interceptor for better error messages
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const message = error.response.data || error.message;
          throw new Error(`Magento API Error (${error.response.status}): ${JSON.stringify(message)}`);
        }
        throw error;
      }
    );
  }

  // Product operations
  async getProducts(searchCriteria?: string): Promise<Product[]> {
    const params = searchCriteria || 'searchCriteria[pageSize]=20';
    const response = await this.client.get(`/products?${params}`);
    return response.data.items || [];
  }

  async getProductBySku(sku: string): Promise<Product> {
    const response = await this.client.get(`/products/${encodeURIComponent(sku)}`);
    return response.data;
  }

  async searchProducts(query: string, pageSize: number = 20): Promise<Product[]> {
    const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=name&searchCriteria[filterGroups][0][filters][0][value]=%${query}%&searchCriteria[filterGroups][0][filters][0][conditionType]=like&searchCriteria[pageSize]=${pageSize}`;
    return this.getProducts(searchCriteria);
  }

  async updateProduct(sku: string, product: Partial<Product>): Promise<Product> {
    const response = await this.client.put(`/products/${encodeURIComponent(sku)}`, {
      product,
    });
    return response.data;
  }

  async updateProductStock(sku: string, qty: number, isInStock: boolean = true): Promise<any> {
    const response = await this.client.put(`/products/${encodeURIComponent(sku)}/stockItems/1`, {
      stockItem: {
        qty,
        is_in_stock: isInStock,
      },
    });
    return response.data;
  }

  // Customer operations
  async getCustomers(searchCriteria?: string): Promise<Customer[]> {
    const params = searchCriteria || 'searchCriteria[pageSize]=20';
    const response = await this.client.get(`/customers/search?${params}`);
    return response.data.items || [];
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.client.get(`/customers/${id}`);
    return response.data;
  }

  async searchCustomersByEmail(email: string): Promise<Customer[]> {
    const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=%${email}%&searchCriteria[filterGroups][0][filters][0][conditionType]=like`;
    return this.getCustomers(searchCriteria);
  }

  // Order operations
  async getOrders(searchCriteria?: string): Promise<Order[]> {
    const params = searchCriteria || 'searchCriteria[pageSize]=20';
    const response = await this.client.get(`/orders?${params}`);
    return response.data.items || [];
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async searchOrdersByCustomerEmail(email: string): Promise<Order[]> {
    const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=customer_email&searchCriteria[filterGroups][0][filters][0][value]=${email}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
    return this.getOrders(searchCriteria);
  }

  async searchOrdersByStatus(status: string): Promise<Order[]> {
    const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=status&searchCriteria[filterGroups][0][filters][0][value]=${status}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC`;
    return this.getOrders(searchCriteria);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get('/categories');
    return response.data.children_data || [];
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await this.client.get(`/categories/${id}`);
    return response.data;
  }

  // Cart/Quote operations
  async createCart(): Promise<string> {
    const response = await this.client.post('/carts/mine');
    return response.data; // Returns quote ID
  }

  // Store info
  async getStoreConfig(): Promise<any> {
    const response = await this.client.get('/store/storeConfigs');
    return response.data;
  }

  async getStoreViews(): Promise<any[]> {
    const response = await this.client.get('/store/storeViews');
    return response.data;
  }

  // Inventory/Stock
  async getStockStatus(sku: string): Promise<any> {
    const response = await this.client.get(`/stockStatuses/${encodeURIComponent(sku)}`);
    return response.data;
  }

  // CMS Pages
  async getCmsPages(searchCriteria?: string): Promise<any[]> {
    const params = searchCriteria || 'searchCriteria[pageSize]=20';
    const response = await this.client.get(`/cmsPage/search?${params}`);
    return response.data.items || [];
  }

  async getCmsPageById(id: number): Promise<any> {
    const response = await this.client.get(`/cmsPage/${id}`);
    return response.data;
  }

  // Generic search with custom criteria
  async customSearch(endpoint: string, searchCriteria: string): Promise<any> {
    const response = await this.client.get(`${endpoint}?${searchCriteria}`);
    return response.data;
  }
}
