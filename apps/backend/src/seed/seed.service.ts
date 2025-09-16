import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { TenantService } from '../tenants/tenant.service';
import { UserRole } from '../users/user.entity';
import { TenantRole, ChallengeType, ChallengeDifficulty } from '../tenants/tenant.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  async onModuleInit() {
    // Only seed in development
    if (process.env.NODE_ENV === 'development') {
      await this.seedData();
    }
  }

  private async seedData() {
    try {
      // Seed sample users
      await this.seedUsers();
      
      // Seed sample tenants
      await this.seedTenants();
      
      console.log('✅ Sample data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding data:', error.message);
    }
  }

  private async seedUsers() {
    const sampleUsers = [
      {
        email: 'user@t4g.fun',
        name: 'Regular User',
        auth0Id: 'auth0|sample_user_123',
        role: UserRole.USER,
      },
      {
        email: 'moderator@t4g.fun',
        name: 'Moderator User',
        auth0Id: 'auth0|sample_mod_456',
        role: UserRole.MODERATOR,
      },
      {
        email: 'admin@t4g.fun',
        name: 'Admin User',
        auth0Id: 'auth0|sample_admin_789',
        role: UserRole.ADMIN,
      },
    ];

    for (const userData of sampleUsers) {
      try {
        const existingUser = this.userService.findByAuth0Id(userData.auth0Id);
        if (!existingUser) {
          await this.userService.createUser(userData);
          console.log(`Created sample user: ${userData.email}`);
        }
      } catch (error) {
        // User might already exist, which is fine
        if (!error.message.includes('already exists')) {
          console.error(`Error creating user ${userData.email}:`, error.message);
        }
      }
    }
  }

  private async seedTenants() {
    const sampleTenants = [
      {
        email: 'admin@t4g.space',
        name: 'T4G Admin',
        auth0Id: 'auth0|sample_tenant_admin_123',
        organizationName: 'T4G Demo Organization',
        organizationId: 'org_demo_123',
        role: TenantRole.TENANT_ADMIN,
      },
      {
        email: 'manager@t4g.space',
        name: 'T4G Manager',
        auth0Id: 'auth0|sample_tenant_manager_456',
        organizationName: 'T4G Demo Organization',
        organizationId: 'org_demo_123',
        role: TenantRole.TENANT_MANAGER,
      },
    ];

    for (const tenantData of sampleTenants) {
      try {
        const existingTenant = this.tenantService.findByAuth0Id(tenantData.auth0Id);
        if (!existingTenant) {
          const tenant = await this.tenantService.createTenant(tenantData);
          console.log(`Created sample tenant: ${tenantData.email}`);

          // Seed some sample gifts and challenges for the admin tenant
          if (tenantData.role === TenantRole.TENANT_ADMIN) {
            await this.seedSampleGifts(tenant.id);
            await this.seedSampleChallenges(tenant.id);
          }
        }
      } catch (error) {
        // Tenant might already exist, which is fine
        if (!error.message.includes('already exists')) {
          console.error(`Error creating tenant ${tenantData.email}:`, error.message);
        }
      }
    }
  }

  private async seedSampleGifts(tenantId: string) {
    const sampleGifts = [
      {
        name: 'Premium Coffee',
        description: 'A week\'s worth of premium coffee beans',
        value: 25,
        category: 'Food & Beverage',
        imageUrl: 'https://example.com/coffee.jpg',
      },
      {
        name: 'Tech Gadget',
        description: 'Bluetooth earbuds for music lovers',
        value: 75,
        category: 'Electronics',
        imageUrl: 'https://example.com/earbuds.jpg',
      },
      {
        name: 'Wellness Package',
        description: 'Spa voucher for relaxation',
        value: 100,
        category: 'Wellness',
        imageUrl: 'https://example.com/spa.jpg',
      },
    ];

    for (const giftData of sampleGifts) {
      try {
        await this.tenantService.createGift(giftData, tenantId);
        console.log(`Created sample gift: ${giftData.name}`);
      } catch (error) {
        console.error(`Error creating gift ${giftData.name}:`, error.message);
      }
    }
  }

  private async seedSampleChallenges(tenantId: string) {
    const sampleChallenges = [
      {
        title: 'Daily Steps Challenge',
        description: 'Walk 10,000 steps every day for a week',
        type: ChallengeType.WEEKLY,
        difficulty: ChallengeDifficulty.EASY,
        points: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        rules: ['Track steps using fitness app', 'Minimum 10,000 steps per day'],
        rewards: [
          { type: 'points' as const, value: 100, description: '100 bonus points' },
          { type: 'badge' as const, value: 'walker', description: 'Walking Champion badge' },
        ],
      },
      {
        title: 'Learning Challenge',
        description: 'Complete 3 online courses this month',
        type: ChallengeType.MONTHLY,
        difficulty: ChallengeDifficulty.MEDIUM,
        points: 300,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        rules: ['Courses must be at least 2 hours long', 'Provide completion certificates'],
        rewards: [
          { type: 'points' as const, value: 300, description: '300 bonus points' },
          { type: 'gift' as const, value: 'Premium Coffee', description: 'Premium coffee package' },
        ],
      },
    ];

    for (const challengeData of sampleChallenges) {
      try {
        await this.tenantService.createChallenge(challengeData, tenantId);
        console.log(`Created sample challenge: ${challengeData.title}`);
      } catch (error) {
        console.error(`Error creating challenge ${challengeData.title}:`, error.message);
      }
    }
  }
}