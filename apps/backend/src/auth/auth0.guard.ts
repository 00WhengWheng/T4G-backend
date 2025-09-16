import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Auth0UserGuard extends AuthGuard('auth0-user') {}

@Injectable()
export class Auth0TenantGuard extends AuthGuard('auth0-tenant') {}