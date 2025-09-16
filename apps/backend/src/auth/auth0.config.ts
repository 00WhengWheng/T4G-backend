import { registerAs } from '@nestjs/config';

export interface Auth0Config {
  userDomain: string;
  userClientId: string;
  userClientSecret: string;
  tenantDomain: string;
  tenantClientId: string;
  tenantClientSecret: string;
  callbackUrlUser: string;
  callbackUrlTenant: string;
  frontendUrlUser: string;
  frontendUrlTenant: string;
  sessionSecret: string;
}

export default registerAs('auth0', (): Auth0Config => ({
  userDomain: process.env.AUTH0_USER_DOMAIN || '',
  userClientId: process.env.AUTH0_USER_CLIENT_ID || '',
  userClientSecret: process.env.AUTH0_USER_CLIENT_SECRET || '',
  tenantDomain: process.env.AUTH0_TENANT_DOMAIN || '',
  tenantClientId: process.env.AUTH0_TENANT_CLIENT_ID || '',
  tenantClientSecret: process.env.AUTH0_TENANT_CLIENT_SECRET || '',
  callbackUrlUser: process.env.AUTH0_CALLBACK_URL_USER || 'http://localhost:3000/api/auth/callback/user',
  callbackUrlTenant: process.env.AUTH0_CALLBACK_URL_TENANT || 'http://localhost:3000/api/auth/callback/tenant',
  frontendUrlUser: process.env.FRONTEND_URL_USER || 'https://t4g.fun',
  frontendUrlTenant: process.env.FRONTEND_URL_TENANT || 'https://t4g.space',
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
}));