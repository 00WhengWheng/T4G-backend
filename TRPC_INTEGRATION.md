# tRPC Integration Guide

This document outlines the tRPC integration with the T4G NestJS + Fastify backend.

## Overview

The backend now supports both REST API endpoints and tRPC procedures for type-safe communication with the frontends:
- **t4g.fun** - User-facing application
- **t4g.space** - Tenant dashboard

## tRPC Endpoints

### Base URL
All tRPC procedures are available at: `http://localhost:3000/trpc/`

### Available Procedures

#### Health Check
- **Path**: `health`
- **Type**: Query
- **Description**: Returns server status and timestamp
- **Example**: `GET /trpc/health?input={}`

#### User Procedures (T4G.fun)

**Authentication Required**: Bearer token in Authorization header

- **user.getProfile** - Get current user profile
- **user.updateProfile** - Update user profile 
- **user.getById** - Get user by ID (admin only)
- **user.listUsers** - List all users (admin only)
- **user.activateUser** - Activate user (admin only)
- **user.deactivateUser** - Deactivate user (admin only)

#### Tenant Procedures (T4G.space)

**Authentication Required**: Bearer token in Authorization header (tenant domain)

- **tenant.getProfile** - Get current tenant profile
- **tenant.updateProfile** - Update tenant profile
- **tenant.getDashboardAnalytics** - Get dashboard analytics

**Gift Management:**
- **tenant.gifts.create** - Create new gift
- **tenant.gifts.list** - List organization gifts
- **tenant.gifts.update** - Update gift
- **tenant.gifts.delete** - Delete gift

**Challenge Management:**
- **tenant.challenges.create** - Create new challenge
- **tenant.challenges.list** - List organization challenges
- **tenant.challenges.update** - Update challenge
- **tenant.challenges.delete** - Delete challenge

## Authentication

The tRPC server supports JWT token verification for both user and tenant domains:

### User Authentication (t4g.fun)
- Domain: Configured via `AUTH0_USER_DOMAIN`
- Client ID: Configured via `AUTH0_USER_CLIENT_ID`
- Pass JWT token as `Authorization: Bearer <token>`

### Tenant Authentication (t4g.space)
- Domain: Configured via `AUTH0_TENANT_DOMAIN`  
- Client ID: Configured via `AUTH0_TENANT_CLIENT_ID`
- Pass JWT token as `Authorization: Bearer <token>`
- Must have `app_metadata.domain` set to "t4g.space"

## Type Safety

The tRPC integration provides full type safety with:
- Input validation using Zod schemas
- TypeScript type inference
- Automatic error handling
- Serialization with SuperJSON

## Client Usage Examples

### Frontend Integration (t4g.fun)

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/backend/trpc.router';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }),
  ],
});

// Get user profile
const profile = await client.user.getProfile.query();

// Update user profile  
const updated = await client.user.updateProfile.mutate({
  name: 'New Name',
  preferences: { theme: 'dark' }
});
```

### Frontend Integration (t4g.space)

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/backend/trpc.router';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        Authorization: `Bearer ${tenantToken}`,
      },
    }),
  ],
});

// Get dashboard analytics
const analytics = await client.tenant.getDashboardAnalytics.query();

// Create a gift
const gift = await client.tenant.gifts.create.mutate({
  name: 'Special Gift',
  description: 'A special reward',
  value: 100,
  category: 'rewards'
});
```

## Testing tRPC Endpoints

### Using curl

```bash
# Health check
curl -X GET "http://localhost:3000/trpc/health?input=%7B%7D"

# User profile (requires auth token)
curl -X GET "http://localhost:3000/trpc/user.getProfile?input=%7B%7D" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"

# Tenant analytics (requires tenant auth token)  
curl -X GET "http://localhost:3000/trpc/tenant.getDashboardAnalytics?input=%7B%7D" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

### Using tRPC Playground

For development, you can use the tRPC Playground or similar tools to explore and test the API endpoints interactively.

## Error Handling

The tRPC integration includes comprehensive error handling:

- **UNAUTHORIZED**: Missing or invalid authentication token
- **FORBIDDEN**: Insufficient permissions for the requested operation  
- **NOT_FOUND**: Resource not found
- **PARSE_ERROR**: Invalid input data
- **INTERNAL_SERVER_ERROR**: Server-side errors

All errors include detailed messages and proper HTTP status codes.

## Development

The tRPC server is automatically started with the NestJS application and is available at `/trpc/*` endpoints. The integration preserves all existing REST API functionality while adding type-safe tRPC procedures.