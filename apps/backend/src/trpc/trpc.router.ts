import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from './trpc.service';
import { UserService } from '../users/user.service';
import { TenantService } from '../tenants/tenant.service';
import { UserRole } from '../users/user.entity';
import { TenantPermission, TenantRole, ChallengeType, ChallengeDifficulty } from '../tenants/tenant.entity';

// Zod schemas for validation
const userPreferencesSchema = z.object({
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark']),
  language: z.string(),
  emailUpdates: z.boolean(),
}).partial();

const updateUserSchema = z.object({
  name: z.string().optional(),
  picture: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
  isActive: z.boolean().optional(),
});

const tenantSettingsSchema = z.object({
  dashboardTheme: z.enum(['light', 'dark']),
  notifications: z.boolean(),
  analyticsEnabled: z.boolean(),
  realTimeUpdates: z.boolean(),
}).partial();

const updateTenantSchema = z.object({
  name: z.string().optional(),
  picture: z.string().optional(),
  organizationName: z.string().optional(),
  settings: tenantSettingsSchema.optional(),
  isActive: z.boolean().optional(),
});

const createGiftSchema = z.object({
  name: z.string(),
  description: z.string(),
  value: z.number(),
  category: z.string(),
  imageUrl: z.string().optional(),
});

const updateGiftSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  value: z.number().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

const challengeRewardSchema = z.object({
  type: z.enum(['gift', 'points', 'badge']),
  value: z.union([z.string(), z.number()]),
  description: z.string(),
});

const createChallengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.nativeEnum(ChallengeType),
  difficulty: z.nativeEnum(ChallengeDifficulty),
  points: z.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  rules: z.array(z.string()).optional(),
  rewards: z.array(challengeRewardSchema).optional(),
});

const updateChallengeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(ChallengeType).optional(),
  difficulty: z.nativeEnum(ChallengeDifficulty).optional(),
  points: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  rules: z.array(z.string()).optional(),
  rewards: z.array(challengeRewardSchema).optional(),
});

@Injectable()
export class TrpcRouter {
  public appRouter: any;

  constructor(
    private readonly trpc: TrpcService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {
    this.appRouter = this.createAppRouter();
  }

  private createAppRouter() {
    const userRouter = this.createUserRouter();
    const tenantRouter = this.createTenantRouter();

    return this.trpc.router({
      // Health check
      health: this.trpc.procedure
        .query(() => ({
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'tRPC server is running',
        })),

      // User routes for T4G.fun
      user: userRouter,

      // Tenant routes for T4G.space
      tenant: tenantRouter,
    });
  }

  private createUserRouter() {
    return this.trpc.router({
      // Get user profile
      getProfile: this.trpc.userProcedure
        .query(async ({ ctx }) => {
          const user = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!user) {
            throw new Error('User profile not found');
          }
          return user;
        }),

      // Update user profile
      updateProfile: this.trpc.userProcedure
        .input(updateUserSchema)
        .mutation(async ({ input, ctx }) => {
          const user = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!user) {
            throw new Error('User profile not found');
          }
          return this.userService.updateUser(user.id, input);
        }),

      // Get user by ID (admin only)
      getById: this.trpc.userProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
          const currentUser = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
            throw new Error('Insufficient permissions');
          }
          return this.userService.findById(input.id);
        }),

      // List all users (admin only)
      listUsers: this.trpc.userProcedure
        .query(async ({ ctx }) => {
          const currentUser = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
            throw new Error('Insufficient permissions');
          }
          // Use getAllUsers since findMany doesn't exist
          return this.userService.getAllUsers();
        }),

      // Activate user (admin only)
      activateUser: this.trpc.userProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const currentUser = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
            throw new Error('Insufficient permissions');
          }
          return this.userService.updateUser(input.id, { isActive: true });
        }),

      // Deactivate user (admin only)
      deactivateUser: this.trpc.userProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const currentUser = await this.userService.findByAuth0Id(ctx.user!.id);
          if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
            throw new Error('Insufficient permissions');
          }
          return this.userService.updateUser(input.id, { isActive: false });
        }),
    });
  }

  private createTenantRouter() {
    return this.trpc.router({
      // Get tenant profile
      getProfile: this.trpc.tenantProcedure
        .query(async ({ ctx }) => {
          const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
          if (!tenant) {
            throw new Error('Tenant profile not found');
          }
          return tenant;
        }),

      // Update tenant profile
      updateProfile: this.trpc.tenantProcedure
        .input(updateTenantSchema)
        .mutation(async ({ input, ctx }) => {
          const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
          if (!tenant) {
            throw new Error('Tenant profile not found');
          }
          return this.tenantService.updateTenant(tenant.id, input);
        }),

      // Get dashboard analytics
      getDashboardAnalytics: this.trpc.tenantProcedure
        .query(async ({ ctx }) => {
          const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
          if (!tenant) {
            throw new Error('Tenant profile not found');
          }
          return this.tenantService.getDashboardAnalytics(tenant.organizationId);
        }),

      // Gift management
      gifts: this.trpc.router({
        // Create gift
        create: this.trpc.tenantProcedure
          .input(createGiftSchema)
          .mutation(async ({ input, ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.createGift(input as any, tenant.id);
          }),

        // List gifts
        list: this.trpc.tenantProcedure
          .query(async ({ ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            return this.tenantService.getGiftsByOrganization(tenant.organizationId);
          }),

        // Update gift
        update: this.trpc.tenantProcedure
          .input(z.object({ id: z.string() }).merge(updateGiftSchema))
          .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.updateGift(id, updateData, tenant.id);
          }),

        // Delete gift
        delete: this.trpc.tenantProcedure
          .input(z.object({ id: z.string() }))
          .mutation(async ({ input, ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_GIFTS)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.deleteGift(input.id, tenant.id);
          }),
      }),

      // Challenge management
      challenges: this.trpc.router({
        // Create challenge
        create: this.trpc.tenantProcedure
          .input(createChallengeSchema)
          .mutation(async ({ input, ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.createChallenge(input as any, tenant.id);
          }),

        // List challenges
        list: this.trpc.tenantProcedure
          .query(async ({ ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            return this.tenantService.getChallengesByOrganization(tenant.organizationId);
          }),

        // Update challenge
        update: this.trpc.tenantProcedure
          .input(z.object({ id: z.string() }).merge(updateChallengeSchema))
          .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.updateChallenge(id, updateData as any, tenant.id);
          }),

        // Delete challenge
        delete: this.trpc.tenantProcedure
          .input(z.object({ id: z.string() }))
          .mutation(async ({ input, ctx }) => {
            const tenant = await this.tenantService.findByAuth0Id(ctx.user!.id);
            if (!tenant) {
              throw new Error('Tenant profile not found');
            }
            if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES)) {
              throw new Error('Insufficient permissions');
            }
            return this.tenantService.deleteChallenge(input.id, tenant.id);
          }),
      }),
    });
  }
}

export type AppRouter = TrpcRouter['appRouter'];