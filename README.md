# Tag 4 Gift Admin - NestJS + Fastify Backend

A high-performance backend API built with NestJS framework and Fastify adapter, organized as a Turborepo monorepo.

## 🚀 Features

- **NestJS Framework** - Scalable Node.js server-side applications
- **Fastify Adapter** - High-performance web framework
- **Turborepo** - Monorepo build system for better developer experience
- **TypeScript** - Type-safe development
- **Jest Testing** - Unit and E2E testing
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
.
├── apps/
│   └── backend/          # NestJS + Fastify API application
│       ├── src/
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
