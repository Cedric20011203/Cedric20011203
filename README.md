# Magento 2 MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Magento 2 e-commerce platforms. This server enables AI assistants like Claude to interact with your Magento 2 store through a comprehensive set of tools for managing products, customers, orders, and more.

## Features

This MCP server provides 18 powerful tools for interacting with Magento 2:

### Product Management
- **magento_get_products** - List products with optional search criteria
- **magento_search_products** - Search products by name
- **magento_get_product** - Get detailed product information by SKU
- **magento_update_product** - Update product information
- **magento_update_stock** - Update product stock levels
- **magento_get_stock_status** - Check stock status for a product

### Customer Management
- **magento_get_customers** - List customers with optional search criteria
- **magento_search_customers** - Search customers by email
- **magento_get_customer** - Get detailed customer information by ID

### Order Management
- **magento_get_orders** - List orders with optional search criteria
- **magento_get_order** - Get detailed order information by ID
- **magento_search_orders_by_email** - Find orders by customer email
- **magento_search_orders_by_status** - Find orders by status (pending, processing, complete, etc.)

### Catalog & Content
- **magento_get_categories** - Get category tree structure
- **magento_get_category** - Get detailed category information
- **magento_get_cms_pages** - List CMS pages
- **magento_get_cms_page** - Get specific CMS page content

### Store Information
- **magento_get_store_config** - Get store configuration

## Prerequisites

- Node.js 18 or higher
- A Magento 2 store with REST API access
- Magento 2 Integration Token (see setup instructions below)

## Getting Your Magento 2 Integration Token

1. Log in to your Magento 2 admin panel
2. Navigate to **System > Extensions > Integrations**
3. Click **Add New Integration**
4. Fill in the integration details:
   - Name: "MCP Server Integration"
   - Your Password: (enter your admin password)
5. Go to the **API** tab
6. Select **Resource Access** - choose "All" or specific resources you want to grant access to
7. Click **Save**
8. Click **Activate** on your new integration
9. In the popup, click **Allow**
10. Copy the **Access Token** - this is your `MAGENTO_ACCESS_TOKEN`

**Important Security Note**: In Magento 2.4.4+, integration tokens are disabled as standalone Bearer tokens by default. To enable them:

```bash
bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
bin/magento cache:flush
```

Or enable via Admin: **Stores > Configuration > Services > OAuth > Consumer Settings > Allow OAuth Access Tokens to be used as standalone Bearer tokens** = Yes

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd magento-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Magento credentials:
```env
MAGENTO_BASE_URL=https://licendi.com
MAGENTO_ACCESS_TOKEN=your_integration_token_here
API_TIMEOUT=30000
```

5. Build the project:
```bash
npm run build
```

## Usage

### Running Standalone

Start the server:
```bash
npm start
```

The server will run on stdio and communicate via the Model Context Protocol.

### Using with Claude Desktop

Add this server to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "magento": {
      "command": "node",
      "args": ["/absolute/path/to/magento-mcp-server/build/index.js"],
      "env": {
        "MAGENTO_BASE_URL": "https://licendi.com",
        "MAGENTO_ACCESS_TOKEN": "your_integration_token_here"
      }
    }
  }
}
```

After adding the configuration, restart Claude Desktop.

### Using with Other MCP Clients

This server uses the standard MCP protocol and can be integrated with any MCP-compatible client. The server communicates via stdio transport.

## Example Queries

Once configured, you can ask Claude questions like:

- "Show me the latest 10 orders from my Magento store"
- "Search for products containing 'shirt' in the name"
- "Get the details of product with SKU 'ABC123'"
- "Update the stock quantity of SKU 'ABC123' to 50 units"
- "Find all orders with status 'pending'"
- "Show me all customers with email containing 'example.com'"
- "Get the category tree for my store"
- "What are the current store configuration settings?"

## Development

### Project Structure

```
magento-mcp-server/
├── src/
│   ├── index.ts           # Main MCP server implementation
│   └── magento-client.ts  # Magento 2 REST API client
├── build/                 # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Development Mode

Run TypeScript compiler in watch mode:
```bash
npm run dev
```

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

## API Reference

### Magento REST API

This server uses the Magento 2 REST API v1 endpoints. Key endpoints include:

- `/rest/V1/products` - Product management
- `/rest/V1/customers` - Customer management
- `/rest/V1/orders` - Order management
- `/rest/V1/categories` - Category management
- `/rest/V1/cmsPage` - CMS page management
- `/rest/V1/store/storeConfigs` - Store configuration

For more information, see the [Magento 2 REST API Documentation](https://developer.adobe.com/commerce/webapi/rest/quick-reference/).

## Troubleshooting

### Authentication Errors

If you receive 401 Unauthorized errors:
1. Verify your access token is correct
2. Ensure the integration is activated in Magento admin
3. Check that Bearer token authentication is enabled (see setup instructions)
4. Verify the integration has the necessary API permissions

### Connection Errors

If you receive connection errors:
1. Verify the `MAGENTO_BASE_URL` is correct and accessible
2. Check if your Magento site has SSL/TLS enabled
3. Verify firewall rules allow outbound HTTPS connections
4. Try increasing the `API_TIMEOUT` value in your `.env` file

### 503 Service Unavailable

If the Magento store returns 503:
1. Check if the store is in maintenance mode
2. Verify the server is running and accessible
3. Check Magento logs at `var/log/` in your Magento installation

## Security Considerations

- Never commit your `.env` file to version control
- Use integration tokens with minimal required permissions
- Rotate your access tokens periodically
- Consider using IP whitelisting for API access in production
- Monitor API usage and implement rate limiting if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions:
- Check the [Magento 2 REST API Documentation](https://developer.adobe.com/commerce/webapi/rest/)
- Review the [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- Open an issue in this repository

## Credits

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Magento 2 REST API](https://developer.adobe.com/commerce/webapi/rest/)
- TypeScript & Node.js
