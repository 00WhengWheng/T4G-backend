import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import auth0Config from './auth0.config';

@Injectable()
export class Auth0TenantStrategy extends PassportStrategy(Strategy, 'auth0-tenant') {
  constructor(
    @Inject(auth0Config.KEY)
    private config: ConfigType<typeof auth0Config>,
  ) {
    super({
      domain: config.tenantDomain,
      clientID: config.tenantClientId,
      clientSecret: config.tenantClientSecret,
      callbackURL: config.callbackUrlTenant,
    });
  }

  async validate(accessToken: string, refreshToken: string, extraParams: any, profile: any) {
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value || profile.email,
      name: profile.displayName || profile.name,
      picture: profile.picture,
      accessToken,
      refreshToken,
      type: 'tenant',
      domain: 't4g.space',
    };
  }
}