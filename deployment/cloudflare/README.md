# Cloudflare Full-Stack Deployment

This directory contains configuration for deploying the Workflow Management System to Cloudflare's edge platform, providing a complete full-stack solution with global performance.

## Overview

Cloudflare deployment uses:
- **Cloudflare Pages** - Frontend hosting with global CDN
- **Cloudflare Workers** - Serverless backend API
- **D1 Database** - Serverless SQL database
- **R2 Object Storage** - File storage and serving
- **KV Storage** - Caching and session management
- **Durable Objects** - WebSocket connections and real-time features

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Worker     │    │   D1 Database   │
│ (Cloudflare     │    │ (Serverless      │    │ (PostgreSQL     │
│  Pages)         │◄──►│  Functions)      │◄──►│  Compatible)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │   R2 Storage    │             │
         │              │ (File Uploads)  │             │
         │              └─────────────────┘             │
         │                       │                       │
         │              ┌────────▼────────┐             │
         └─────────────►│   KV Storage    │◄────────────┘
                        │ (Cache/Session) │
                        └─────────────────┘
```

## Features

### ✅ Complete Full-Stack Solution
- Frontend SPA hosting with automatic HTTPS
- Serverless backend API with global edge deployment
- Real-time WebSocket connections via Durable Objects
- File upload/download with R2 object storage
- SQL database with D1 (SQLite at edge)

### ✅ Performance & Scalability
- Global CDN with 200+ edge locations
- Sub-50ms response times worldwide
- Automatic scaling with zero configuration
- Built-in DDoS protection and security

### ✅ Developer Experience
- Git-based deployments with preview URLs
- Built-in CI/CD with Wrangler CLI
- Real-time logs and analytics
- Zero cold starts for Workers

## Quick Start

### Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Initial Deployment
```bash
cd deployment/cloudflare

# Initialize complete infrastructure
./deploy.sh init

# Or deploy to preview
./deploy.sh

# Deploy to production
./deploy.sh prod
```

### Individual Deployments
```bash
# Deploy only Workers (backend)
./deploy.sh workers

# Deploy only Pages (frontend)  
./deploy.sh pages

# Setup infrastructure only
./deploy.sh setup
```

## Configuration

### 1. Update Configuration Files

**wrangler.toml** - Update these values:
```toml
account_id = "your_cloudflare_account_id"
zone_id = "your_cloudflare_zone_id"  # Optional, for custom domains
```

**pages.toml** - Update domains:
```toml
[[custom_domains]]
domain = "your-domain.com"
```

### 2. Environment Variables

Set these in Cloudflare dashboard or via CLI:

**Production Environment:**
```bash
wrangler secret put DATABASE_URL
wrangler secret put SECRET_KEY
wrangler secret put AWS_ACCESS_KEY_ID  # If using external services
```

**Pages Environment Variables:**
- `VITE_API_URL` - Your API Worker URL
- `VITE_FILE_SERVER_URL` - Your file serving URL
- `NODE_ENV` - production/staging

### 3. Database Setup

The deployment script automatically:
1. Creates D1 database
2. Applies schema from `schema.sql`
3. Inserts sample data

Manual database operations:
```bash
# Execute SQL commands
wrangler d1 execute workflow-management --command "SELECT * FROM workflows;"

# Execute SQL file
wrangler d1 execute workflow-management --file schema.sql

# Backup database
wrangler d1 export workflow-management --output backup.sql
```

### 4. File Storage Setup

R2 bucket is automatically created. Configure CORS if needed:
```bash
wrangler r2 bucket cors put workflow-files --file cors.json
```

## API Endpoints

Once deployed, your API will be available at `https://api.your-domain.com`:

### Core Endpoints
- `GET /health` - Health check
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### File Operations
- `GET /api/files` - List files
- `POST /api/files` - Upload file
- `GET /files/:filename` - Download file

### Device Management
- `GET /api/devices` - List devices
- `POST /api/devices` - Register device

### Real-time Features
- `WS /ws` - WebSocket connection for real-time updates

## Custom Domains

### Setup Process
1. Add domain to Cloudflare DNS
2. Update `zone_id` in configuration
3. Configure custom domains in dashboard
4. Update frontend environment variables

### Recommended Structure
- `https://workflow-management.com` - Frontend
- `https://api.workflow-management.com` - API Worker  
- `https://files.workflow-management.com` - File serving

## Monitoring & Analytics

### Built-in Features
- Real-time analytics in Cloudflare dashboard
- Worker execution logs
- Performance metrics
- Error tracking

### Access Logs
```bash
# Tail Worker logs
wrangler tail workflow-management-api

# View deployment logs
wrangler pages deployment list --project-name workflow-management
```

### Custom Analytics
The system includes Analytics Engine integration for custom metrics:
```javascript
// In Worker code
env.WORKFLOW_ANALYTICS.writeDataPoint({
  blobs: ["workflow_execution"],
  doubles: [response_time],
  indexes: ["user_id"]
});
```

## Security Features

### Automatic Security
- DDoS protection
- Bot mitigation
- SSL/TLS encryption
- Global WAF

### Application Security
- CORS configuration
- Security headers
- Input validation
- Rate limiting

### Authentication
Implement authentication in Workers:
```javascript
// JWT validation example
const token = request.headers.get('Authorization');
const user = await validateJWT(token, env.JWT_SECRET);
```

## Cost Optimization

### Free Tier Limits
- **Pages**: 1 build per day, 500 builds/month
- **Workers**: 100,000 requests/day
- **D1**: 5 databases, 25GB storage
- **R2**: 10GB storage/month
- **KV**: 1,000 writes/day

### Paid Features
- Unlimited builds and requests
- Analytics and logs retention
- Advanced security features
- Priority support

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs
wrangler pages deployment list --project-name workflow-management

# Local development
wrangler pages dev dist
```

**Worker Errors:**
```bash
# View real-time logs
wrangler tail workflow-management-api

# Check Worker status
wrangler status
```

**Database Issues:**
```bash
# Test database connection
wrangler d1 execute workflow-management --command "SELECT 1;"

# Check database info
wrangler d1 info workflow-management
```

### Debug Mode
Enable debug logging in Workers:
```javascript
// In worker code
console.log('Debug info:', { request: request.url, timestamp: Date.now() });
```

## Migration from Other Platforms

### From Vercel/Netlify
1. Copy build configuration
2. Update environment variables
3. Migrate database to D1
4. Update API endpoints

### From AWS/Traditional Hosting
1. Migrate database schema to D1
2. Convert backend to Workers
3. Move files to R2 storage
4. Update DNS settings

## Advanced Features

### Durable Objects (Real-time)
WebSocket connections for real-time workflow updates:
```javascript
// Client connection
const ws = new WebSocket('wss://api.your-domain.com/ws');
ws.send(JSON.stringify({ type: 'subscribe', channel: 'workflow:123' }));
```

### Edge-side Includes (ESI)
Cache dynamic content at edge:
```javascript
// In Worker
const cache = caches.default;
const cacheKey = new Request(url, request);
let response = await cache.match(cacheKey);
```

### Geolocation
Access user location for regional features:
```javascript
// In Worker
const country = request.cf.country;
const city = request.cf.city;
```

## Support & Resources

### Official Documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)

### Community
- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Workers Examples](https://github.com/cloudflare/worker-examples)
- [Community Forums](https://community.cloudflare.com/)

### Getting Help
1. Check Cloudflare dashboard for errors
2. Review Worker logs with `wrangler tail`
3. Test locally with `wrangler dev`
4. Consult official documentation
5. Ask in community forums