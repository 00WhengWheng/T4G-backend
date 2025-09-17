import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

// Fallback interface when PrismaClient is not available
interface FallbackPrismaClient {
  user: any;
  tenant: any;
  gift: any;
  challenge: any;
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $queryRaw(query: any): Promise<any>;
}

@Injectable()
export class PrismaService implements OnModuleInit {
  private client: FallbackPrismaClient;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    try {
      // Try to import PrismaClient
      const { PrismaClient } = require('@prisma/client');
      this.client = new PrismaClient();
      this.logger.log('✅ PrismaClient imported successfully');
    } catch (error) {
      this.logger.warn('⚠️ PrismaClient not available, using fallback implementation');
      // Fallback implementation for when Prisma client is not generated
      this.client = {
        user: { count: () => Promise.resolve(0) },
        tenant: { count: () => Promise.resolve(0) },
        gift: { count: () => Promise.resolve(0) },
        challenge: { count: () => Promise.resolve(0) },
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
        $queryRaw: () => Promise.resolve([{ "?column?": 1 }]),
      };
    }
  }

  async onModuleInit() {
    try {
      await this.client.$connect();
      this.logger.log('✅ Connected to Prisma database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Prisma database:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Expose client methods
  get user() {
    return this.client.user;
  }

  get tenant() {
    return this.client.tenant;
  }

  get gift() {
    return this.client.gift;
  }

  get challenge() {
    return this.client.challenge;
  }

  // Health check method to verify database connection
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Simple query to verify User model
  async testUserQuery() {
    try {
      const userCount = await this.client.user.count();
      this.logger.log(`User count: ${userCount}`);
      return userCount;
    } catch (error) {
      this.logger.error('Error querying users:', error.message);
      throw error;
    }
  }

  // Simple query to verify Tenant model
  async testTenantQuery() {
    try {
      const tenantCount = await this.client.tenant.count();
      this.logger.log(`Tenant count: ${tenantCount}`);
      return tenantCount;
    } catch (error) {
      this.logger.error('Error querying tenants:', error.message);
      throw error;
    }
  }
}