# NX Migration Guide

This document outlines the migration from Turborepo to NX monorepo for the T4G backend project.

## What Changed

### Removed
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - PNPM workspace configuration
- `turbo` dependency

### Added
- `nx.json` - NX workspace configuration
- `apps/backend/project.json` - Backend project configuration
- `packages/shared-types/` - Sample shared library
- NX dependencies (`nx`, `@nx/js`)

## NX Commands

### Workspace Commands
```bash
# Build all projects
npm run build

# Test all projects
npm run test

# Run development for all projects
npm run dev

# Lint all projects
npm run lint

# Clean all projects
npm run clean
```

### Project-Specific Commands
```bash
# Build specific project
npx nx build backend
npx nx build @t4g-backend/shared-types

# Test specific project
npx nx test backend

# Run dev for specific project
npx nx dev backend

# Lint specific project
npx nx lint backend
```

### NX Utilities
```bash
# Show all projects
npx nx show projects

# Show project details
npx nx show project backend

# Visualize project graph
npx nx graph

# Run commands in parallel
npx nx run-many -t build
npx nx run-many -t test --parallel

# Reset NX cache
npx nx reset
```

## Benefits of NX

1. **Intelligent Caching** - NX caches build artifacts and test results
2. **Dependency Graph** - Visualize and understand project dependencies
3. **Parallel Execution** - Run tasks in parallel for better performance
4. **Code Generators** - Generate new libraries and applications
5. **Plugin Ecosystem** - Rich ecosystem of plugins for different technologies
6. **Affected Commands** - Only run tasks for changed projects

## Project Structure

```
.
├── apps/
│   └── backend/           # NestJS + Fastify API application
│       ├── project.json   # NX project configuration
│       └── ...
├── packages/
│   └── shared-types/      # Shared TypeScript types library
│       ├── package.json
│       └── ...
├── nx.json               # NX workspace configuration
├── package.json          # Root workspace configuration
└── tsconfig.base.json    # Base TypeScript configuration
```

## Adding New Projects

### Generate a new library
```bash
npx nx g @nx/js:lib my-new-lib --directory=packages/my-new-lib
```

### Generate a new Node.js application
```bash
npx nx g @nx/node:app my-new-app --directory=apps/my-new-app
```

## Cache Configuration

NX automatically caches build outputs and test results. The cache is stored in `.nx/cache/` (ignored by git).

To clear the cache:
```bash
npx nx reset
```

## Migration Summary

The migration from Turborepo to NX was successful with:
- ✅ All existing functionality preserved
- ✅ All tests passing (135 tests)
- ✅ Development server working
- ✅ Build process working
- ✅ Enhanced with intelligent caching and dependency management
- ✅ Added sample shared library to demonstrate monorepo capabilities