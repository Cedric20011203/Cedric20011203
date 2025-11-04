#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { MagentoClient } from './magento-client.js';

// Load environment variables
dotenv.config();

const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL || 'https://licendi.com';
const MAGENTO_ACCESS_TOKEN = process.env.MAGENTO_ACCESS_TOKEN || '';

if (!MAGENTO_ACCESS_TOKEN) {
  console.error('Error: MAGENTO_ACCESS_TOKEN is required in .env file');
  process.exit(1);
}

// Initialize Magento client
const magentoClient = new MagentoClient({
  baseUrl: MAGENTO_BASE_URL,
  accessToken: MAGENTO_ACCESS_TOKEN,
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),
});

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'magento_get_products',
    description: 'Get products from Magento store with optional search criteria. Returns a list of products with details like SKU, name, price, and status.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of products to return (default: 20)',
          default: 20,
        },
        searchCriteria: {
          type: 'string',
          description: 'Optional Magento search criteria query string',
        },
      },
    },
  },
  {
    name: 'magento_search_products',
    description: 'Search products by name. Performs a LIKE search on product names.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against product names',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'magento_get_product',
    description: 'Get detailed information about a specific product by SKU.',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'Product SKU identifier',
        },
      },
      required: ['sku'],
    },
  },
  {
    name: 'magento_update_product',
    description: 'Update product information by SKU. Can update fields like name, price, status, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'Product SKU identifier',
        },
        productData: {
          type: 'object',
          description: 'Product data to update (e.g., {name: "New Name", price: 99.99, status: 1})',
        },
      },
      required: ['sku', 'productData'],
    },
  },
  {
    name: 'magento_update_stock',
    description: 'Update product stock quantity and availability.',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'Product SKU identifier',
        },
        quantity: {
          type: 'number',
          description: 'Stock quantity',
        },
        inStock: {
          type: 'boolean',
          description: 'Whether the product is in stock',
          default: true,
        },
      },
      required: ['sku', 'quantity'],
    },
  },
  {
    name: 'magento_get_customers',
    description: 'Get customers from Magento store with optional search criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of customers to return (default: 20)',
          default: 20,
        },
        searchCriteria: {
          type: 'string',
          description: 'Optional Magento search criteria query string',
        },
      },
    },
  },
  {
    name: 'magento_search_customers',
    description: 'Search customers by email address.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to search for (partial match supported)',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'magento_get_customer',
    description: 'Get detailed information about a specific customer by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'number',
          description: 'Customer ID',
        },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'magento_get_orders',
    description: 'Get orders from Magento store with optional search criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of orders to return (default: 20)',
          default: 20,
        },
        searchCriteria: {
          type: 'string',
          description: 'Optional Magento search criteria query string',
        },
      },
    },
  },
  {
    name: 'magento_get_order',
    description: 'Get detailed information about a specific order by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'number',
          description: 'Order entity ID',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'magento_search_orders_by_email',
    description: 'Search orders by customer email address.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email address',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'magento_search_orders_by_status',
    description: 'Search orders by status (e.g., pending, processing, complete, canceled).',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Order status (pending, processing, complete, canceled, etc.)',
        },
      },
      required: ['status'],
    },
  },
  {
    name: 'magento_get_categories',
    description: 'Get all categories from the Magento store including category tree structure.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'magento_get_category',
    description: 'Get detailed information about a specific category by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'number',
          description: 'Category ID',
        },
      },
      required: ['categoryId'],
    },
  },
  {
    name: 'magento_get_store_config',
    description: 'Get Magento store configuration information.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'magento_get_stock_status',
    description: 'Get stock status for a specific product by SKU.',
    inputSchema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'Product SKU identifier',
        },
      },
      required: ['sku'],
    },
  },
  {
    name: 'magento_get_cms_pages',
    description: 'Get CMS pages from Magento store.',
    inputSchema: {
      type: 'object',
      properties: {
        searchCriteria: {
          type: 'string',
          description: 'Optional Magento search criteria query string',
        },
      },
    },
  },
  {
    name: 'magento_get_cms_page',
    description: 'Get a specific CMS page by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'number',
          description: 'CMS page ID',
        },
      },
      required: ['pageId'],
    },
  },
  {
    name: 'magento_create_cms_page',
    description: 'Create a new CMS page or blog post in Magento.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Page title',
        },
        identifier: {
          type: 'string',
          description: 'URL key/identifier (e.g., "my-blog-post")',
        },
        content: {
          type: 'string',
          description: 'HTML content of the page',
        },
        active: {
          type: 'boolean',
          description: 'Whether the page is active/published',
          default: true,
        },
        pageLayout: {
          type: 'string',
          description: 'Page layout (e.g., "1column", "2columns-left")',
          default: '1column',
        },
        metaTitle: {
          type: 'string',
          description: 'Meta title for SEO',
        },
        metaKeywords: {
          type: 'string',
          description: 'Meta keywords for SEO',
        },
        metaDescription: {
          type: 'string',
          description: 'Meta description for SEO',
        },
        storeId: {
          type: 'array',
          description: 'Array of store IDs (default: [0] for all stores)',
          items: {
            type: 'number',
          },
        },
      },
      required: ['title', 'identifier', 'content'],
    },
  },
  {
    name: 'magento_update_cms_page',
    description: 'Update an existing CMS page or blog post.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'number',
          description: 'CMS page ID to update',
        },
        title: {
          type: 'string',
          description: 'Page title',
        },
        identifier: {
          type: 'string',
          description: 'URL key/identifier',
        },
        content: {
          type: 'string',
          description: 'HTML content of the page',
        },
        active: {
          type: 'boolean',
          description: 'Whether the page is active/published',
        },
        pageLayout: {
          type: 'string',
          description: 'Page layout',
        },
        metaTitle: {
          type: 'string',
          description: 'Meta title for SEO',
        },
        metaKeywords: {
          type: 'string',
          description: 'Meta keywords for SEO',
        },
        metaDescription: {
          type: 'string',
          description: 'Meta description for SEO',
        },
      },
      required: ['pageId'],
    },
  },
  {
    name: 'magento_delete_cms_page',
    description: 'Delete a CMS page by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'number',
          description: 'CMS page ID to delete',
        },
      },
      required: ['pageId'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'magento-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'magento_get_products': {
        const limit = (args?.limit as number) || 20;
        const searchCriteria =
          (args?.searchCriteria as string) || `searchCriteria[pageSize]=${limit}`;
        const products = await magentoClient.getProducts(searchCriteria);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      }

      case 'magento_search_products': {
        const query = args?.query as string;
        const limit = (args?.limit as number) || 20;
        const products = await magentoClient.searchProducts(query, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      }

      case 'magento_get_product': {
        const sku = args?.sku as string;
        const product = await magentoClient.getProductBySku(sku);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      }

      case 'magento_update_product': {
        const sku = args?.sku as string;
        const productData = args?.productData as any;
        const product = await magentoClient.updateProduct(sku, productData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      }

      case 'magento_update_stock': {
        const sku = args?.sku as string;
        const quantity = args?.quantity as number;
        const inStock = (args?.inStock as boolean) ?? true;
        const result = await magentoClient.updateProductStock(sku, quantity, inStock);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'magento_get_customers': {
        const limit = (args?.limit as number) || 20;
        const searchCriteria =
          (args?.searchCriteria as string) || `searchCriteria[pageSize]=${limit}`;
        const customers = await magentoClient.getCustomers(searchCriteria);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      }

      case 'magento_search_customers': {
        const email = args?.email as string;
        const customers = await magentoClient.searchCustomersByEmail(email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      }

      case 'magento_get_customer': {
        const customerId = args?.customerId as number;
        const customer = await magentoClient.getCustomerById(customerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customer, null, 2),
            },
          ],
        };
      }

      case 'magento_get_orders': {
        const limit = (args?.limit as number) || 20;
        const searchCriteria =
          (args?.searchCriteria as string) || `searchCriteria[pageSize]=${limit}`;
        const orders = await magentoClient.getOrders(searchCriteria);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      }

      case 'magento_get_order': {
        const orderId = args?.orderId as number;
        const order = await magentoClient.getOrderById(orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(order, null, 2),
            },
          ],
        };
      }

      case 'magento_search_orders_by_email': {
        const email = args?.email as string;
        const orders = await magentoClient.searchOrdersByCustomerEmail(email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      }

      case 'magento_search_orders_by_status': {
        const status = args?.status as string;
        const orders = await magentoClient.searchOrdersByStatus(status);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      }

      case 'magento_get_categories': {
        const categories = await magentoClient.getCategories();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(categories, null, 2),
            },
          ],
        };
      }

      case 'magento_get_category': {
        const categoryId = args?.categoryId as number;
        const category = await magentoClient.getCategoryById(categoryId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(category, null, 2),
            },
          ],
        };
      }

      case 'magento_get_store_config': {
        const config = await magentoClient.getStoreConfig();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      }

      case 'magento_get_stock_status': {
        const sku = args?.sku as string;
        const stockStatus = await magentoClient.getStockStatus(sku);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stockStatus, null, 2),
            },
          ],
        };
      }

      case 'magento_get_cms_pages': {
        const searchCriteria = args?.searchCriteria as string;
        const pages = await magentoClient.getCmsPages(searchCriteria);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pages, null, 2),
            },
          ],
        };
      }

      case 'magento_get_cms_page': {
        const pageId = args?.pageId as number;
        const page = await magentoClient.getCmsPageById(pageId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(page, null, 2),
            },
          ],
        };
      }

      case 'magento_create_cms_page': {
        const pageData: any = {
          title: args?.title as string,
          identifier: args?.identifier as string,
          content: args?.content as string,
          active: args?.active !== undefined ? args.active : true,
          page_layout: args?.pageLayout as string || '1column',
          store_id: args?.storeId || [0],
        };

        if (args?.metaTitle) pageData.meta_title = args.metaTitle;
        if (args?.metaKeywords) pageData.meta_keywords = args.metaKeywords;
        if (args?.metaDescription) pageData.meta_description = args.metaDescription;

        const result = await magentoClient.createCmsPage(pageData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'magento_update_cms_page': {
        const pageId = args?.pageId as number;
        const pageData: any = {};

        if (args?.title) pageData.title = args.title;
        if (args?.identifier) pageData.identifier = args.identifier;
        if (args?.content) pageData.content = args.content;
        if (args?.active !== undefined) pageData.active = args.active;
        if (args?.pageLayout) pageData.page_layout = args.pageLayout;
        if (args?.metaTitle) pageData.meta_title = args.metaTitle;
        if (args?.metaKeywords) pageData.meta_keywords = args.metaKeywords;
        if (args?.metaDescription) pageData.meta_description = args.metaDescription;

        const result = await magentoClient.updateCmsPage(pageId, pageData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'magento_delete_cms_page': {
        const pageId = args?.pageId as number;
        const result = await magentoClient.deleteCmsPage(pageId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: result, pageId }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Magento MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
