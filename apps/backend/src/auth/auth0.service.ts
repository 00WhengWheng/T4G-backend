import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
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
  app_metadata?: {
    domain?: string;
    role?: string;
  };
}

@Injectable()
export class Auth0Service {
  private userJwksClient: jwksClient.JwksClient;
  private tenantJwksClient: jwksClient.JwksClient;

  constructor(
    @Inject(auth0Config.KEY)
    private config: ConfigType<typeof auth0Config>,
  ) {
    this.userJwksClient = jwksClient({
      jwksUri: `https://${this.config.userDomain}/.well-known/jwks.json`,
      requestHeaders: {},
      timeout: 30000,
    });

    this.tenantJwksClient = jwksClient({
      jwksUri: `https://${this.config.tenantDomain}/.well-known/jwks.json`,
      requestHeaders: {},
      timeout: 30000,
    });
  }

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

  /**
   * Create or update user/tenant after successful Auth0 authentication
   */
  async handleSuccessfulAuth(authUser: AuthUser): Promise<any> {
    try {
      if (authUser.type === 'user') {
        // Import UserService here to avoid circular dependency
        const { UserService } = await import('../users/user.service');
        // For now, return the auth user as we don't have dependency injection setup
        // In a real implementation, this would create/update the user in the database
        return authUser;
      } else if (authUser.type === 'tenant') {
        // Import TenantService here to avoid circular dependency
        const { TenantService } = await import('../tenants/tenant.service');
        // For now, return the auth user as we don't have dependency injection setup
        // In a real implementation, this would create/update the tenant in the database
        return authUser;
      }
      
      return authUser;
    } catch (error) {
      console.error('Error handling successful auth:', error);
      return authUser;
    }
  }

  /**
   * Verify Auth0 JWT token and return user information
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // Decode the token header to determine which domain it's from
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        return null;
      }

      const issuer = (decoded.payload as any).iss as string;
      let domain: string;
      let clientId: string;
      let jwksClient: jwksClient.JwksClient;

      if (issuer.includes(this.config.userDomain)) {
        domain = this.config.userDomain;
        clientId = this.config.userClientId;
        jwksClient = this.userJwksClient;
      } else if (issuer.includes(this.config.tenantDomain)) {
        domain = this.config.tenantDomain;
        clientId = this.config.tenantClientId;
        jwksClient = this.tenantJwksClient;
      } else {
        return null;
      }

      // Get the signing key
      const kid = decoded.header.kid;
      if (!kid) {
        return null;
      }

      const signingKey = await new Promise<string>((resolve, reject) => {
        jwksClient.getSigningKey(kid, (err, key) => {
          if (err) {
            reject(err);
          } else {
            resolve(key?.getPublicKey() || '');
          }
        });
      });

      // Verify the token
      const payload = jwt.verify(token, signingKey, {
        audience: clientId,
        issuer: `https://${domain}/`,
        algorithms: ['RS256'],
      }) as any;

      if (!payload || !payload.sub) {
        return null;
      }

      // Determine user type based on domain
      const userType = domain === this.config.userDomain ? 'user' : 'tenant';

      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name || payload.email || '',
        picture: payload.picture,
        type: userType,
        domain: userType === 'user' ? 't4g.fun' : 't4g.space',
        app_metadata: payload['https://t4g.app/app_metadata'] || {},
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}