# Tag 4 Gift Admin - NestJS + Fastify Backend

A high-performance backend API built with NestJS framework and Fastify adapter, organized as a Turborepo monorepo.

## 🚀 Features

- **NestJS Framework** - Scalable Node.js server-side applications
- **Fastify Adapter** - High-performance web framework
- **Auth0 Integration** - Authentication for both user and tenant domains
- **Turborepo** - Monorepo build system for better developer experience
- **TypeScript** - Type-safe development
- **Jest Testing** - Unit and E2E testing
- **ESLint** - Code linting and formatting

## 🔐 Auth0 Authentication

This application implements Auth0 authentication for two distinct frontends:

### Supported Domains
- **t4g.fun** - User domain authentication
- **t4g.space** - Tenant domain authentication

### Authentication Endpoints

#### User Domain (t4g.fun)
- `GET /api/auth/login/user` - Redirect to Auth0 login for users
- `GET /api/auth/callback/user` - Auth0 callback for user authentication
- `GET /api/auth/logout/user` - Logout users and redirect to Auth0 logout
- `GET /api/auth/profile/user` - Get authenticated user profile (protected)

#### Tenant Domain (t4g.space)
- `GET /api/auth/login/tenant` - Redirect to Auth0 login for tenants
- `GET /api/auth/callback/tenant` - Auth0 callback for tenant authentication
- `GET /api/auth/logout/tenant` - Logout tenants and redirect to Auth0 logout
- `GET /api/auth/profile/tenant` - Get authenticated tenant profile (protected)

#### General
- `GET /api/auth/status` - Check authentication status

### Environment Configuration

Copy `.env.example` to `.env` and configure the following Auth0 variables:

```bash
# Auth0 Configuration for User Domain (t4g.fun)
AUTH0_USER_DOMAIN=your-auth0-domain.auth0.com
AUTH0_USER_CLIENT_ID=your-user-client-id
AUTH0_USER_CLIENT_SECRET=your-user-client-secret

# Auth0 Configuration for Tenant Domain (t4g.space)
AUTH0_TENANT_DOMAIN=your-auth0-domain.auth0.com
AUTH0_TENANT_CLIENT_ID=your-tenant-client-id
AUTH0_TENANT_CLIENT_SECRET=your-tenant-client-secret

# Auth0 Callback URLs
AUTH0_CALLBACK_URL_USER=http://localhost:3000/api/auth/callback/user
AUTH0_CALLBACK_URL_TENANT=http://localhost:3000/api/auth/callback/tenant

# Frontend URLs
FRONTEND_URL_USER=https://t4g.fun
FRONTEND_URL_TENANT=https://t4g.space

# Session Secret
SESSION_SECRET=your-session-secret-here
```

### Auth0 Setup

1. Create two Auth0 applications in your Auth0 dashboard:
   - One for user domain (t4g.fun)
   - One for tenant domain (t4g.space)

2. Configure the following settings for each application:
   - **Application Type**: Regular Web Application
   - **Allowed Callback URLs**: 
     - User: `http://localhost:3000/api/auth/callback/user`, `https://your-api-domain.com/api/auth/callback/user`
     - Tenant: `http://localhost:3000/api/auth/callback/tenant`, `https://your-api-domain.com/api/auth/callback/tenant`
   - **Allowed Logout URLs**: 
     - User: `https://t4g.fun`, `http://localhost:3001`
     - Tenant: `https://t4g.space`, `http://localhost:3002`
   - **Allowed Web Origins**: Your frontend domains

3. Copy the Domain, Client ID, and Client Secret for each application to your `.env` file

### CORS Configuration

The application is configured to allow CORS for:
- `https://t4g.fun`
- `https://t4g.space`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)

## 📁 Project Structure

```
.
├── apps/
│   └── backend/          # NestJS + Fastify API application
│       ├── src/
│       │   ├── auth/     # Auth0 authentication module
│       │   │   ├── auth0.config.ts      # Auth0 configuration
│       │   │   ├── auth0.service.ts     # Auth0 business logic
│       │   │   ├── auth0.controller.ts  # Auth0 endpoints
│       │   │   ├── auth0.module.ts      # Auth0 module
│       │   │   ├── auth0.guard.ts       # Auth0 guards
│       │   │   ├── auth0-user.strategy.ts   # User domain strategy
│       │   │   └── auth0-tenant.strategy.ts # Tenant domain strategy
│       │   ├── app.controller.ts
│       │   ├── app.module.ts
│       │   ├── app.service.ts
│       │   └── main.ts
│       ├── test/         # E2E tests
│       └── package.json
├── packages/             # Shared packages (ready for future expansion)
├── package.json          # Root workspace configuration
└── turbo.json           # Turborepo configuration
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build all applications
npm run lint         # Lint all code
npm run test         # Run all tests

# Backend specific (run from apps/backend/)
npm run start        # Start production server
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run E2E tests
```

### Starting the Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api`

### API Endpoints

- `GET /api` - Welcome message
- `GET /api/health` - Health check endpoint

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests** - Jest-based unit tests for services and controllers
- **E2E Tests** - End-to-end API testing with Fastify test utilities
- **Test Coverage** - Coverage reports available via `npm run test:cov`

## 🏗️ Building for Production

```bash
# Build all applications
npm run build

# Start production server
cd apps/backend && npm run start:prod
```

## 📝 Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10+
- **Web Server**: Fastify 4+
- **Language**: TypeScript 5+
- **Build Tool**: Turborepo
- **Testing**: Jest
- **Linting**: ESLint + TypeScript ESLint

## 🚀 Deployment

The application is containerized and production-ready. The built artifacts are located in `apps/backend/dist/` after running the build command.

Environment variables:
- `PORT` - Server port (default: 3000)

## 📈 Performance

This setup leverages Fastify's high performance capabilities:
- Low overhead HTTP server
- Fast JSON serialization
- Efficient routing
- TypeScript for better development experience

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Run tests: `npm run test`
5. Build project: `npm run build`
