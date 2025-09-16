import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { 
  TenantRole, 
  TenantPermission,
  CreateTenantDto,
  CreateGiftDto,
  CreateChallengeDto,
  ChallengeType,
  ChallengeDifficulty
} from './tenant.entity';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_ADMIN,
      };

      const tenant = await service.createTenant(createTenantDto);

      expect(tenant).toBeDefined();
      expect(tenant.email).toBe(createTenantDto.email);
      expect(tenant.organizationName).toBe(createTenantDto.organizationName);
      expect(tenant.role).toBe(TenantRole.TENANT_ADMIN);
      expect(tenant.permissions).toContain(TenantPermission.MANAGE_GIFTS);
      expect(tenant.isActive).toBe(true);
    });

    it('should throw ConflictException if tenant already exists', async () => {
      const createTenantDto: CreateTenantDto = {
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
      };

      await service.createTenant(createTenantDto);

      await expect(service.createTenant(createTenantDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('gift management', () => {
    let tenantId: string;

    beforeEach(async () => {
      const tenant = await service.createTenant({
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_ADMIN,
      });
      tenantId = tenant.id;
    });

    it('should create a gift successfully', async () => {
      const createGiftDto: CreateGiftDto = {
        name: 'Test Gift',
        description: 'A test gift',
        value: 100,
        category: 'Electronics',
      };

      const gift = await service.createGift(createGiftDto, tenantId);

      expect(gift).toBeDefined();
      expect(gift.name).toBe(createGiftDto.name);
      expect(gift.createdBy).toBe(tenantId);
      expect(gift.isActive).toBe(true);
    });

    it('should throw ForbiddenException if tenant lacks permissions', async () => {
      // Create a tenant without gift management permissions
      const limitedTenant = await service.createTenant({
        email: 'limited@example.com',
        name: 'Limited Tenant',
        auth0Id: 'auth0|limited123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_USER, // No gift management permissions
      });

      const createGiftDto: CreateGiftDto = {
        name: 'Test Gift',
        description: 'A test gift',
        value: 100,
        category: 'Electronics',
      };

      await expect(service.createGift(createGiftDto, limitedTenant.id))
        .rejects.toThrow(ForbiddenException);
    });

    it('should get gifts by organization', async () => {
      const createGiftDto: CreateGiftDto = {
        name: 'Test Gift',
        description: 'A test gift',
        value: 100,
        category: 'Electronics',
      };

      await service.createGift(createGiftDto, tenantId);
      
      const tenant = await service.findById(tenantId);
      const gifts = await service.getGiftsByOrganization(tenant!.organizationId);

      expect(gifts).toHaveLength(1);
      expect(gifts[0].name).toBe('Test Gift');
    });
  });

  describe('challenge management', () => {
    let tenantId: string;

    beforeEach(async () => {
      const tenant = await service.createTenant({
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_ADMIN,
      });
      tenantId = tenant.id;
    });

    it('should create a challenge successfully', async () => {
      const createChallengeDto: CreateChallengeDto = {
        title: 'Test Challenge',
        description: 'A test challenge',
        type: ChallengeType.DAILY,
        difficulty: ChallengeDifficulty.EASY,
        points: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // 1 day later
      };

      const challenge = await service.createChallenge(createChallengeDto, tenantId);

      expect(challenge).toBeDefined();
      expect(challenge.title).toBe(createChallengeDto.title);
      expect(challenge.createdBy).toBe(tenantId);
      expect(challenge.isActive).toBe(true);
    });
  });

  describe('permissions', () => {
    it('should correctly assign permissions based on role', async () => {
      const adminTenant = await service.createTenant({
        email: 'admin@example.com',
        name: 'Admin Tenant',
        auth0Id: 'auth0|admin123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_ADMIN,
      });

      const userTenant = await service.createTenant({
        email: 'user@example.com',
        name: 'User Tenant',
        auth0Id: 'auth0|user123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_USER,
      });

      expect(service.hasPermission(adminTenant, TenantPermission.MANAGE_GIFTS)).toBe(true);
      expect(service.hasPermission(adminTenant, TenantPermission.MANAGE_SETTINGS)).toBe(true);
      
      expect(service.hasPermission(userTenant, TenantPermission.VIEW_ANALYTICS)).toBe(true);
      expect(service.hasPermission(userTenant, TenantPermission.MANAGE_GIFTS)).toBe(false);
    });
  });

  describe('dashboard analytics', () => {
    it('should return dashboard analytics for tenant with permissions', async () => {
      const tenant = await service.createTenant({
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_ADMIN,
      });

      // Create some test data
      await service.createGift({
        name: 'Gift 1',
        description: 'Test gift',
        value: 100,
        category: 'Electronics',
      }, tenant.id);

      await service.createChallenge({
        title: 'Challenge 1',
        description: 'Test challenge',
        type: ChallengeType.DAILY,
        difficulty: ChallengeDifficulty.EASY,
        points: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      }, tenant.id);

      const analytics = await service.getDashboardAnalytics(tenant.id);

      expect(analytics).toBeDefined();
      expect(analytics.stats.totalGifts).toBe(1);
      expect(analytics.stats.totalChallenges).toBe(1);
      expect(analytics.organizationId).toBe(tenant.organizationId);
    });

    it('should throw ForbiddenException if tenant lacks analytics permission', async () => {
      // Create tenant without analytics permissions (though this shouldn't happen in practice)
      const tenant = await service.createTenant({
        email: 'tenant@example.com',
        name: 'Test Tenant',
        auth0Id: 'auth0|tenant123',
        organizationName: 'Test Org',
        organizationId: 'org123',
        role: TenantRole.TENANT_USER,
      });

      // Manually remove analytics permission for testing
      tenant.permissions = [];

      await expect(service.getDashboardAnalytics(tenant.id))
        .rejects.toThrow(ForbiddenException);
    });
  });
});