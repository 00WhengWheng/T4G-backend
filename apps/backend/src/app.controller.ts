import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('api-docs')
  getApiDocs() {
    return {
      title: 'T4G NestJS Backend API',
      version: '1.0.0',
      description: 'API for Tag 4 Gift application with separate user and tenant domains',
      domains: {
        user: 't4g.fun',
        tenant: 't4g.space',
      },
      endpoints: {
        authentication: {
          description: 'Auth0 authentication endpoints',
          endpoints: {
            'GET /api/auth/login/user': 'Login for T4G.fun users',
            'GET /api/auth/login/tenant': 'Login for T4G.space tenants', 
            'GET /api/auth/callback/user': 'Auth0 callback for users',
            'GET /api/auth/callback/tenant': 'Auth0 callback for tenants',
            'GET /api/auth/logout/user': 'Logout users',
            'GET /api/auth/logout/tenant': 'Logout tenants',
            'GET /api/auth/profile/user': 'Get user profile (protected)',
            'GET /api/auth/profile/tenant': 'Get tenant profile (protected)',
            'GET /api/auth/status': 'Check authentication status',
          },
        },
        users: {
          description: 'User management endpoints for T4G.fun app',
          endpoints: {
            'GET /api/users/profile': 'Get current user profile',
            'PUT /api/users/profile': 'Update current user profile',
            'GET /api/users/:id': 'Get user by ID (admin only)',
            'GET /api/users': 'List all users (admin only)',
            'PUT /api/users/:id/activate': 'Activate user (admin only)',
            'PUT /api/users/:id/deactivate': 'Deactivate user (admin only)',
          },
        },
        tenants: {
          description: 'Tenant management endpoints for T4G.space dashboard',
          endpoints: {
            'GET /api/tenants/profile': 'Get current tenant profile',
            'PUT /api/tenants/profile': 'Update current tenant profile',
            'GET /api/tenants/dashboard/analytics': 'Get dashboard analytics',
            'POST /api/tenants/gifts': 'Create new gift',
            'GET /api/tenants/gifts': 'List organization gifts',
            'PUT /api/tenants/gifts/:id': 'Update gift',
            'DELETE /api/tenants/gifts/:id': 'Delete gift',
            'POST /api/tenants/challenges': 'Create new challenge',
            'GET /api/tenants/challenges': 'List organization challenges',
            'PUT /api/tenants/challenges/:id': 'Update challenge',
            'DELETE /api/tenants/challenges/:id': 'Delete challenge',
          },
        },
      },
      roles: {
        users: {
          USER: 'Regular T4G.fun app users - can view and update own profile',
          MODERATOR: 'Can moderate content and assist other users',
          ADMIN: 'Full admin access to user management',
        },
        tenants: {
          TENANT_USER: 'Basic tenant users - can view analytics',
          TENANT_MANAGER: 'Can manage gifts and challenges',
          TENANT_ADMIN: 'Full tenant admin - can manage everything including users and settings',
        },
      },
      features: {
        authentication: 'Auth0 integration for secure login and session management',
        userManagement: 'Role-based user management with preferences',
        tenantDashboard: 'Real-time dashboard with analytics for tenant users',
        giftManagement: 'Create and manage gifts for challenges and rewards',
        challengeManagement: 'Create and manage various types of challenges with rewards',
        permissionSystem: 'Role-based access control for both users and tenants',
        dataSeeding: 'Sample data seeding for development environment',
      },
    };
  }
}