import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Body, 
  UseGuards, 
  Req,
  ForbiddenException,
  NotFoundException 
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { TenantService } from './tenant.service';
import { 
  CreateTenantDto, 
  UpdateTenantDto,
  CreateGiftDto,
  UpdateGiftDto,
  CreateChallengeDto,
  UpdateChallengeDto,
  TenantPermission
} from './tenant.entity';
import { Auth0TenantGuard } from '../auth/auth0.guard';
import { AuthUser } from '../auth/auth0.service';

@Controller('tenants')
@UseGuards(Auth0TenantGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // Tenant Profile Management
  @Get('profile')
  async getProfile(@Req() req: FastifyRequest & { user: AuthUser }) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }
    return tenant;
  }

  @Put('profile')
  async updateProfile(
    @Body() updateTenantDto: UpdateTenantDto, 
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.updateTenant(tenant.id, updateTenantDto);
  }

  // Dashboard Analytics
  @Get('dashboard/analytics')
  async getDashboardAnalytics(@Req() req: FastifyRequest & { user: AuthUser }) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.getDashboardAnalytics(tenant.id);
  }

  // Gift Management
  @Post('gifts')
  async createGift(
    @Body() createGiftDto: CreateGiftDto,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.createGift(createGiftDto, tenant.id);
  }

  @Get('gifts')
  async getGifts(@Req() req: FastifyRequest & { user: AuthUser }) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_GIFTS) &&
        !this.tenantService.hasPermission(tenant, TenantPermission.VIEW_ANALYTICS)) {
      throw new ForbiddenException('Insufficient permissions to view gifts');
    }

    return this.tenantService.getGiftsByOrganization(tenant.organizationId);
  }

  @Put('gifts/:id')
  async updateGift(
    @Param('id') id: string,
    @Body() updateGiftDto: UpdateGiftDto,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.updateGift(id, updateGiftDto, tenant.id);
  }

  @Delete('gifts/:id')
  async deleteGift(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.tenantService.deleteGift(id, tenant.id);
    return { message: 'Gift deleted successfully' };
  }

  // Challenge Management
  @Post('challenges')
  async createChallenge(
    @Body() createChallengeDto: CreateChallengeDto,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.createChallenge(createChallengeDto, tenant.id);
  }

  @Get('challenges')
  async getChallenges(@Req() req: FastifyRequest & { user: AuthUser }) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.tenantService.hasPermission(tenant, TenantPermission.MANAGE_CHALLENGES) &&
        !this.tenantService.hasPermission(tenant, TenantPermission.VIEW_ANALYTICS)) {
      throw new ForbiddenException('Insufficient permissions to view challenges');
    }

    return this.tenantService.getChallengesByOrganization(tenant.organizationId);
  }

  @Put('challenges/:id')
  async updateChallenge(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantService.updateChallenge(id, updateChallengeDto, tenant.id);
  }

  @Delete('challenges/:id')
  async deleteChallenge(
    @Param('id') id: string,
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const tenant = await this.tenantService.findByAuth0Id(req.user.id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.tenantService.deleteChallenge(id, tenant.id);
    return { message: 'Challenge deleted successfully' };
  }
}