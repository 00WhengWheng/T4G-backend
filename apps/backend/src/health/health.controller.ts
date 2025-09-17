import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('database')
  async checkDatabase() {
    try {
      const isHealthy = await this.prisma.healthCheck();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'postgresql',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('models')
  async checkModels() {
    try {
      // These will fail without database connection but will verify the schema is correct
      const tests = await Promise.allSettled([
        this.prisma.testUserQuery(),
        this.prisma.testTenantQuery(),
      ]);

      return {
        status: 'testing_complete',
        models: {
          user: tests[0].status === 'fulfilled' ? 'accessible' : 'not_connected',
          tenant: tests[1].status === 'fulfilled' ? 'accessible' : 'not_connected',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}