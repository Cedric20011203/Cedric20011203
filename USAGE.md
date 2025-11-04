# Magento 2 MCP Server - Usage Guide

## Quick Start

Your Magento 2 MCP Server has been successfully built and configured for your store at **https://licendi.com**.

### What's Been Set Up

1. **Complete MCP Server Implementation** - 18 tools for comprehensive Magento 2 integration
2. **TypeScript Source Code** - Fully typed, production-ready code
3. **Environment Configuration** - Pre-configured with your access token
4. **Built and Ready** - Compiled JavaScript in the `build/` directory

## Using the MCP Server

### Option 1: With Claude Desktop (Recommended)

1. **Locate your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "magento": {
         "command": "node",
         "args": ["/absolute/path/to/Cedric20011203/build/index.js"],
         "env": {
           "MAGENTO_BASE_URL": "https://licendi.com",
           "MAGENTO_ACCESS_TOKEN": "nbip5nzrpk01cpdf7hu19m8ww7592m91"
         }
       }
     }
   }
   ```

3. **Replace `/absolute/path/to/Cedric20011203`** with the actual path to this directory

4. **Restart Claude Desktop**

5. **Start using it!** You can now ask Claude questions like:
   - "Show me the latest 10 orders from my Magento store"
   - "Search for products with 'laptop' in the name"
   - "What's the current stock level for SKU 'ABC123'?"

### Option 2: Standalone Server

Run the server directly:
```bash
cd /home/user/Cedric20011203
npm start
```

The server will communicate via stdio using the Model Context Protocol.

## Available Tools

### Product Tools
1. **magento_get_products** - List products
2. **magento_search_products** - Search by name
3. **magento_get_product** - Get by SKU
4. **magento_update_product** - Update product data
5. **magento_update_stock** - Update stock levels
6. **magento_get_stock_status** - Check stock

### Customer Tools
7. **magento_get_customers** - List customers
8. **magento_search_customers** - Search by email
9. **magento_get_customer** - Get by ID

### Order Tools
10. **magento_get_orders** - List orders
11. **magento_get_order** - Get by ID
12. **magento_search_orders_by_email** - Find by customer email
13. **magento_search_orders_by_status** - Find by status

### Catalog Tools
14. **magento_get_categories** - Get category tree
15. **magento_get_category** - Get by ID

### Content Tools
16. **magento_get_cms_pages** - List CMS pages
17. **magento_get_cms_page** - Get by ID

### Store Tools
18. **magento_get_store_config** - Get configuration

## Example Queries

Once configured with Claude Desktop, try these:

```
"Show me products in my Magento store"

"Find all pending orders"

"Search for customer with email john@example.com"

"Get details for product SKU-123"

"Update stock quantity for product ABC-456 to 100 units"

"Show me the category structure"

"What orders were placed today?"

"Find products with 'shirt' in the name"
```

## Troubleshooting

### Server Not Responding

1. Check the `.env` file exists and has correct credentials
2. Verify the build completed: `ls -la build/`
3. Test the connection manually:
   ```bash
   curl -H "Authorization: Bearer nbip5nzrpk01cpdf7hu19m8ww7592m91" \
        https://licendi.com/rest/V1/products?searchCriteria[pageSize]=5
   ```

### Authentication Errors

If you get 401 Unauthorized:

1. Verify the integration is active in Magento Admin (**System > Integrations**)
2. Check if Bearer tokens are enabled:
   ```bash
   # In your Magento installation
   bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
   bin/magento cache:flush
   ```
3. Or enable via Admin: **Stores > Configuration > Services > OAuth > Allow OAuth Access Tokens to be used as standalone Bearer tokens** = Yes

### 503 Errors

If the site returns 503:
- Check if maintenance mode is enabled
- Verify the site is accessible: `curl -I https://licendi.com`
- Check Magento logs at `var/log/` on the server

### Build Errors

If you need to rebuild:
```bash
npm run build
```

To rebuild on file changes:
```bash
npm run dev
```

## Security Best Practices

1. **Never commit the `.env` file** - It's already in `.gitignore`
2. **Rotate access tokens periodically** in Magento Admin
3. **Limit API permissions** - Only grant what's needed in the integration settings
4. **Monitor API usage** - Check for unusual activity
5. **Use HTTPS only** - Already configured for licendi.com

## Development

### Making Changes

1. Edit TypeScript files in `src/`
2. Rebuild: `npm run build`
3. Test changes
4. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

### Adding New Tools

To add new Magento API endpoints:

1. Add methods to `src/magento-client.ts`
2. Add tool definition to TOOLS array in `src/index.ts`
3. Add handler in the switch statement
4. Rebuild and test

### Project Structure

```
Cedric20011203/
├── src/
│   ├── index.ts              # Main MCP server (18 tools)
│   └── magento-client.ts     # Magento API client
├── build/                    # Compiled output
│   ├── index.js             # Executable server
│   └── magento-client.js    # Compiled client
├── node_modules/            # Dependencies
├── package.json             # Project config
├── tsconfig.json           # TypeScript config
├── .env                    # Your credentials (not in git)
├── .env.example           # Template
├── README.md              # Full documentation
└── USAGE.md              # This file
```

## Next Steps

1. **Configure Claude Desktop** with the server (see Option 1 above)
2. **Test the connection** with a simple query
3. **Explore the tools** by asking Claude about your store
4. **Monitor usage** and adjust permissions as needed
5. **Extend functionality** by adding custom tools if needed

## Support

- **Magento API Docs**: https://developer.adobe.com/commerce/webapi/rest/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Issues**: Open a GitHub issue in this repository

## What's Next?

Your MCP server is production-ready! You can now:
- Use it with Claude Desktop for natural language store management
- Integrate it with other MCP clients
- Extend it with custom tools for your specific needs
- Use it as a foundation for automation workflows

Enjoy seamless AI-powered Magento 2 management! 🚀
