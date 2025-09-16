import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import auth0Config from './auth0.config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  type: 'user' | 'tenant';
  domain: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class Auth0Service {
  constructor(
    @Inject(auth0Config.KEY)
    private config: ConfigType<typeof auth0Config>,
  ) {}

  getLoginUrl(type: 'user' | 'tenant', returnTo?: string): string {
    const domain = type === 'user' ? this.config.userDomain : this.config.tenantDomain;
    const clientId = type === 'user' ? this.config.userClientId : this.config.tenantClientId;
    const callbackUrl = type === 'user' ? this.config.callbackUrlUser : this.config.callbackUrlTenant;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'openid profile email',
    });

    if (returnTo) {
      params.append('state', returnTo);
    }

    return `https://${domain}/authorize?${params.toString()}`;
  }

  getLogoutUrl(type: 'user' | 'tenant'): string {
    const domain = type === 'user' ? this.config.userDomain : this.config.tenantDomain;
    const clientId = type === 'user' ? this.config.userClientId : this.config.tenantClientId;
    const returnTo = type === 'user' ? this.config.frontendUrlUser : this.config.frontendUrlTenant;
    
    const params = new URLSearchParams({
      client_id: clientId,
      returnTo: returnTo,
    });

    return `https://${domain}/v2/logout?${params.toString()}`;
  }

  getRedirectUrl(user: AuthUser, returnTo?: string): string {
    const frontendUrl = user.type === 'user' ? this.config.frontendUrlUser : this.config.frontendUrlTenant;
    const redirectUrl = returnTo || frontendUrl;
    
    // You can append user info as query params or handle it differently based on your frontend needs
    const params = new URLSearchParams({
      auth: 'success',
      type: user.type,
    });

    return `${redirectUrl}?${params.toString()}`;
  }

  validateUser(user: any): AuthUser | null {
    if (!user || !user.id || !user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      picture: user.picture,
      type: user.type || 'user',
      domain: user.domain || 't4g.fun',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };
  }
}