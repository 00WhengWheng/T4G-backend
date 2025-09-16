import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Auth0UserGuard, Auth0TenantGuard } from './auth0.guard';
import { Auth0Service } from './auth0.service';

@Controller('auth')
export class Auth0Controller {
  constructor(private readonly auth0Service: Auth0Service) {}

  // User domain login endpoints
  @Get('login/user')
  loginUser(@Query('returnTo') returnTo: string, @Res() res: FastifyReply) {
    const loginUrl = this.auth0Service.getLoginUrl('user', returnTo);
    return res.redirect(loginUrl);
  }

  @Get('callback/user')
  @UseGuards(Auth0UserGuard)
  async callbackUser(@Req() req: FastifyRequest & { user: any }, @Res() res: FastifyReply) {
    const user = this.auth0Service.validateUser(req.user);
    if (!user) {
      return res.status(401).send({ error: 'Authentication failed' });
    }

    // You can store user session here if needed
    // For now, redirect to frontend with success params
    const redirectUrl = this.auth0Service.getRedirectUrl(user);
    return res.redirect(redirectUrl);
  }

  @Get('logout/user')
  logoutUser(@Res() res: FastifyReply) {
    const logoutUrl = this.auth0Service.getLogoutUrl('user');
    return res.redirect(logoutUrl);
  }

  // Tenant domain login endpoints
  @Get('login/tenant')
  loginTenant(@Query('returnTo') returnTo: string, @Res() res: FastifyReply) {
    const loginUrl = this.auth0Service.getLoginUrl('tenant', returnTo);
    return res.redirect(loginUrl);
  }

  @Get('callback/tenant')
  @UseGuards(Auth0TenantGuard)
  async callbackTenant(@Req() req: FastifyRequest & { user: any }, @Res() res: FastifyReply) {
    const user = this.auth0Service.validateUser(req.user);
    if (!user) {
      return res.status(401).send({ error: 'Authentication failed' });
    }

    // You can store user session here if needed
    // For now, redirect to frontend with success params
    const redirectUrl = this.auth0Service.getRedirectUrl(user);
    return res.redirect(redirectUrl);
  }

  @Get('logout/tenant')
  logoutTenant(@Res() res: FastifyReply) {
    const logoutUrl = this.auth0Service.getLogoutUrl('tenant');
    return res.redirect(logoutUrl);
  }

  // User profile endpoint (example of protected route)
  @Get('profile/user')
  @UseGuards(Auth0UserGuard)
  getUserProfile(@Req() req: FastifyRequest & { user: any }) {
    const user = this.auth0Service.validateUser(req.user);
    return { user, type: 'user' };
  }

  @Get('profile/tenant')
  @UseGuards(Auth0TenantGuard)
  getTenantProfile(@Req() req: FastifyRequest & { user: any }) {
    const user = this.auth0Service.validateUser(req.user);
    return { user, type: 'tenant' };
  }

  // General auth status endpoint
  @Get('status')
  getAuthStatus(@Req() req: FastifyRequest & { user?: any }) {
    if (req.user) {
      const user = this.auth0Service.validateUser(req.user);
      return { authenticated: true, user };
    }
    return { authenticated: false };
  }
}