import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Only disconnect if the method exists (when using real PrismaClient)
    if (service && typeof service.onModuleDestroy === 'function') {
      await service.onModuleDestroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have healthCheck method', () => {
    expect(service.healthCheck).toBeDefined();
    expect(typeof service.healthCheck).toBe('function');
  });

  it('should have testUserQuery method', () => {
    expect(service.testUserQuery).toBeDefined();
    expect(typeof service.testUserQuery).toBe('function');
  });

  it('should have testTenantQuery method', () => {
    expect(service.testTenantQuery).toBeDefined();
    expect(typeof service.testTenantQuery).toBe('function');
  });

  it('should have database model accessors', () => {
    expect(service.user).toBeDefined();
    expect(service.tenant).toBeDefined();
    expect(service.gift).toBeDefined();
    expect(service.challenge).toBeDefined();
  });

  it('should handle healthCheck gracefully', async () => {
    const result = await service.healthCheck();
    expect(typeof result).toBe('boolean');
  });

  it('should handle testUserQuery gracefully', async () => {
    const result = await service.testUserQuery();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should handle testTenantQuery gracefully', async () => {
    const result = await service.testTenantQuery();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });
});