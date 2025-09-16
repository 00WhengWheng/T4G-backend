import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Auth0Controller } from './auth0.controller';
import { Auth0Service } from './auth0.service';
import { Auth0UserStrategy } from './auth0-user.strategy';
import { Auth0TenantStrategy } from './auth0-tenant.strategy';
import auth0Config from './auth0.config';

@Module({
  imports: [
    ConfigModule.forFeature(auth0Config),
    PassportModule.register({ session: false }),
  ],
  controllers: [Auth0Controller],
  providers: [
    Auth0Service,
    // Only register strategies if Auth0 configuration is available
    ...(process.env.AUTH0_USER_DOMAIN && process.env.AUTH0_USER_CLIENT_ID && process.env.AUTH0_USER_CLIENT_SECRET
      ? [Auth0UserStrategy]
      : []
    ),
    ...(process.env.AUTH0_TENANT_DOMAIN && process.env.AUTH0_TENANT_CLIENT_ID && process.env.AUTH0_TENANT_CLIENT_SECRET
      ? [Auth0TenantStrategy]
      : []
    ),
  ],
  exports: [Auth0Service],
})
export class Auth0Module {}