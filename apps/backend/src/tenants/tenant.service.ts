import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { 
  Tenant, 
  CreateTenantDto, 
  UpdateTenantDto, 
  TenantRole, 
  TenantPermission,
  Gift,
  CreateGiftDto,
  UpdateGiftDto,
  Challenge,
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeType,
  ChallengeDifficulty
} from './tenant.entity';

@Injectable()
export class TenantService {
  private tenants: Map<string, Tenant> = new Map();
  private gifts: Map<string, Gift> = new Map();
  private challenges: Map<string, Challenge> = new Map();

  // Tenant Management
  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existingTenant = this.findByAuth0Id(createTenantDto.auth0Id);
    if (existingTenant) {
      throw new ConflictException('Tenant already exists');
    }

    const tenant: Tenant = {
      id: this.generateId('tenant'),
      email: createTenantDto.email,
      name: createTenantDto.name,
      picture: createTenantDto.picture,
      role: createTenantDto.role || TenantRole.TENANT_USER,
      auth0Id: createTenantDto.auth0Id,
      organizationName: createTenantDto.organizationName,
      organizationId: createTenantDto.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      permissions: this.getDefaultPermissions(createTenantDto.role || TenantRole.TENANT_USER),
      settings: {
        dashboardTheme: 'light',
        notifications: true,
        analyticsEnabled: true,
        realTimeUpdates: true,
      },
    };

    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenants.get(id) || null;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.email === email) {
        return tenant;
      }
    }
    return null;
  }

  findByAuth0Id(auth0Id: string): Tenant | null {
    for (const tenant of this.tenants.values()) {
      if (tenant.auth0Id === auth0Id) {
        return tenant;
      }
    }
    return null;
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updatedTenant: Tenant = {
      ...tenant,
      ...updateTenantDto,
      settings: updateTenantDto.settings 
        ? { ...tenant.settings, ...updateTenantDto.settings }
        : tenant.settings,
      updatedAt: new Date(),
    };

    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  async updateLastLogin(id: string): Promise<void> {
    const tenant = this.tenants.get(id);
    if (tenant) {
      tenant.lastLoginAt = new Date();
      tenant.updatedAt = new Date();
      this.tenants.set(id, tenant);
    }
  }

  // Gift Management
  async createGift(createGiftDto: CreateGiftDto, tenantId: string): Promise<Gift> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
      throw new ForbiddenException('Insufficient permissions to manage gifts');
    }

    const gift: Gift = {
      id: this.generateId('gift'),
      name: createGiftDto.name,
      description: createGiftDto.description,
      value: createGiftDto.value,
      category: createGiftDto.category,
      imageUrl: createGiftDto.imageUrl,
      isActive: true,
      createdBy: tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: tenant.organizationId,
    };

    this.gifts.set(gift.id, gift);
    return gift;
  }

  async updateGift(id: string, updateGiftDto: UpdateGiftDto, tenantId: string): Promise<Gift> {
    const gift = this.gifts.get(id);
    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    const tenant = await this.findById(tenantId);
    if (!tenant || !this.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
      throw new ForbiddenException('Insufficient permissions to manage gifts');
    }

    if (gift.organizationId !== tenant.organizationId) {
      throw new ForbiddenException('Cannot modify gifts from another organization');
    }

    const updatedGift: Gift = {
      ...gift,
      ...updateGiftDto,
      updatedAt: new Date(),
    };

    this.gifts.set(id, updatedGift);
    return updatedGift;
  }

  async getGiftsByOrganization(organizationId: string): Promise<Gift[]> {
    return Array.from(this.gifts.values()).filter(gift => gift.organizationId === organizationId);
  }

  async deleteGift(id: string, tenantId: string): Promise<void> {
    const gift = this.gifts.get(id);
    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    const tenant = await this.findById(tenantId);
    if (!tenant || !this.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
      throw new ForbiddenException('Insufficient permissions to manage gifts');
    }

    if (gift.organizationId !== tenant.organizationId) {
      throw new ForbiddenException('Cannot delete gifts from another organization');
    }

    this.gifts.delete(id);
  }

  // Challenge Management
  async createChallenge(createChallengeDto: CreateChallengeDto, tenantId: string): Promise<Challenge> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
      throw new ForbiddenException('Insufficient permissions to manage challenges');
    }

    const challenge: Challenge = {
      id: this.generateId('challenge'),
      title: createChallengeDto.title,
      description: createChallengeDto.description,
      type: createChallengeDto.type,
      difficulty: createChallengeDto.difficulty,
      points: createChallengeDto.points,
      startDate: createChallengeDto.startDate,
      endDate: createChallengeDto.endDate,
      isActive: true,
      createdBy: tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: tenant.organizationId,
      rules: createChallengeDto.rules || [],
      rewards: createChallengeDto.rewards || [],
    };

    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  async updateChallenge(id: string, updateChallengeDto: UpdateChallengeDto, tenantId: string): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const tenant = await this.findById(tenantId);
    if (!tenant || !this.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
      throw new ForbiddenException('Insufficient permissions to manage challenges');
    }

    if (challenge.organizationId !== tenant.organizationId) {
      throw new ForbiddenException('Cannot modify challenges from another organization');
    }

    const updatedChallenge: Challenge = {
      ...challenge,
      ...updateChallengeDto,
      updatedAt: new Date(),
    };

    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async getChallengesByOrganization(organizationId: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => challenge.organizationId === organizationId);
  }

  async deleteChallenge(id: string, tenantId: string): Promise<void> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const tenant = await this.findById(tenantId);
    if (!tenant || !this.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
      throw new ForbiddenException('Insufficient permissions to manage challenges');
    }

    if (challenge.organizationId !== tenant.organizationId) {
      throw new ForbiddenException('Cannot delete challenges from another organization');
    }

    this.challenges.delete(id);
  }

  // Analytics and User Interactions
  async getDashboardAnalytics(tenantId: string) {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.hasPermission(tenant, TenantPermission.VIEW_ANALYTICS)) {
      throw new ForbiddenException('Insufficient permissions to view analytics');
    }

    const organizationGifts = await this.getGiftsByOrganization(tenant.organizationId);
    const organizationChallenges = await this.getChallengesByOrganization(tenant.organizationId);

    return {
      organizationId: tenant.organizationId,
      stats: {
        totalGifts: organizationGifts.length,
        activeGifts: organizationGifts.filter(g => g.isActive).length,
        totalChallenges: organizationChallenges.length,
        activeChallenges: organizationChallenges.filter(c => c.isActive).length,
      },
      recentActivity: {
        gifts: organizationGifts.slice(-5),
        challenges: organizationChallenges.slice(-5),
      },
    };
  }

  // Permission Management
  hasPermission(tenant: Tenant, permission: TenantPermission): boolean {
    return tenant.permissions.includes(permission);
  }

  private getDefaultPermissions(role: TenantRole): TenantPermission[] {
    const rolePermissions = {
      [TenantRole.TENANT_USER]: [TenantPermission.VIEW_ANALYTICS],
      [TenantRole.TENANT_MANAGER]: [
        TenantPermission.VIEW_ANALYTICS,
        TenantPermission.MANAGE_GIFTS,
        TenantPermission.MANAGE_CHALLENGES,
      ],
      [TenantRole.TENANT_ADMIN]: [
        TenantPermission.VIEW_ANALYTICS,
        TenantPermission.MANAGE_GIFTS,
        TenantPermission.MANAGE_CHALLENGES,
        TenantPermission.MANAGE_USERS,
        TenantPermission.MANAGE_SETTINGS,
      ],
    };

    return rolePermissions[role] || [];
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}