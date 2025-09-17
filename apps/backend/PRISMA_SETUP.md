# Prisma Database Setup

This document explains the Prisma database setup for the T4G backend project.

## Overview

The project uses Prisma as the database ORM with PostgreSQL as the database engine. The setup includes:

- **User Model**: Manages user accounts with roles and preferences
- **Tenant Model**: Manages tenant accounts with organization data and permissions
- **Gift Model**: Manages gifts that can be awarded in challenges
- **Challenge Model**: Manages challenges with different types and difficulties
- **Supporting Models**: Challenge rewards, tenant permissions mapping

## Database Schema

### User Model
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `name`: User's display name
- `picture`: Optional profile picture URL
- `role`: User role (USER, ADMIN, MODERATOR)
- `auth0Id`: Unique Auth0 identifier
- `preferences`: JSON field for user preferences (theme, notifications, etc.)
- Relationships: Can create gifts and challenges

### Tenant Model
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `name`: Tenant's display name
- `role`: Tenant role (TENANT_ADMIN, TENANT_MANAGER, TENANT_USER)
- `organizationName`: Name of the organization
- `organizationId`: Organization identifier
- `settings`: JSON field for tenant settings
- Relationships: Has permissions, can create gifts and challenges

### Gift Model
- `id`: Unique identifier (CUID)
- `name`: Gift name
- `description`: Gift description
- `value`: Monetary value
- `category`: Gift category
- `imageUrl`: Optional image URL
- `organizationId`: Organization this gift belongs to
- Relationships: Can be created by users or tenants, used in challenge rewards

### Challenge Model
- `id`: Unique identifier (CUID)
- `title`: Challenge title
- `description`: Challenge description
- `type`: Challenge type (DAILY, WEEKLY, MONTHLY, SPECIAL)
- `difficulty`: Challenge difficulty (EASY, MEDIUM, HARD)
- `points`: Points awarded for completion
- `startDate` / `endDate`: Challenge duration
- `rules`: Array of rule descriptions
- Relationships: Has rewards, created by users or tenants

## Environment Setup

1. **Database URL Configuration**
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/t4g_database?schema=public"
   ```

2. **Install Dependencies**
   ```bash
   npm install prisma @prisma/client
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

4. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:deploy` - Deploy migrations in production
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database with sample data

## Database Connection Verification

The application includes health check endpoints to verify the database connection:

- `GET /api/health/database` - Check database connectivity
- `GET /api/health/models` - Test model accessibility

## Usage in Services

```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }
}
```

## Migration Commands

When making schema changes:

1. Update `schema.prisma`
2. Run `npm run db:migrate` to create and apply migration
3. Commit both schema and migration files

## Production Deployment

1. Set `DATABASE_URL` environment variable
2. Run `npm run db:deploy` to apply migrations
3. Run `npm run db:generate` to generate client

## Troubleshooting

### Client Generation Issues
If Prisma client generation fails due to network issues:
1. The PrismaService includes a fallback implementation
2. Tests will still pass using the fallback
3. Real database operations require the generated client

### Connection Issues
- Verify `DATABASE_URL` format
- Check database server connectivity
- Ensure database exists and credentials are correct
- Use health check endpoints to diagnose issues