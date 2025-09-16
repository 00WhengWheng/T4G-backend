import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Auth0Service } from './auth0.service';
import auth0Config from './auth0.config';

describe('Auth0Service', () => {
  let service: Auth0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [auth0Config],
        }),
      ],
      providers: [Auth0Service],
    }).compile();

    service = module.get<Auth0Service>(Auth0Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLoginUrl', () => {
    it('should generate user login URL', () => {
      const url = service.getLoginUrl('user');
      expect(url).toContain('authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid+profile+email');
    });

    it('should generate tenant login URL', () => {
      const url = service.getLoginUrl('tenant');
      expect(url).toContain('authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid+profile+email');
    });

    it('should include returnTo in state parameter', () => {
      const returnTo = 'https://example.com/dashboard';
      const url = service.getLoginUrl('user', returnTo);
      expect(url).toContain(`state=${encodeURIComponent(returnTo)}`);
    });
  });

  describe('getLogoutUrl', () => {
    it('should generate user logout URL', () => {
      const url = service.getLogoutUrl('user');
      expect(url).toContain('/v2/logout');
      expect(url).toContain('returnTo=');
    });

    it('should generate tenant logout URL', () => {
      const url = service.getLogoutUrl('tenant');
      expect(url).toContain('/v2/logout');
      expect(url).toContain('returnTo=');
    });
  });

  describe('validateUser', () => {
    it('should validate valid user', () => {
      const userInput = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        type: 'user',
        domain: 't4g.fun',
      };

      const result = service.validateUser(userInput);
      
      expect(result).toEqual({
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        type: 'user',
        domain: 't4g.fun',
        accessToken: undefined,
        refreshToken: undefined,
      });
    });

    it('should return null for invalid user (missing id)', () => {
      const userInput = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = service.validateUser(userInput);
      expect(result).toBeNull();
    });

    it('should return null for invalid user (missing email)', () => {
      const userInput = {
        id: 'auth0|123456',
        name: 'Test User',
      };

      const result = service.validateUser(userInput);
      expect(result).toBeNull();
    });

    it('should use email as name fallback', () => {
      const userInput = {
        id: 'auth0|123456',
        email: 'test@example.com',
        type: 'user',
      };

      const result = service.validateUser(userInput);
      expect(result?.name).toBe('test@example.com');
    });
  });

  describe('getRedirectUrl', () => {
    it('should generate redirect URL for user', () => {
      const user = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user' as const,
        domain: 't4g.fun',
      };

      const url = service.getRedirectUrl(user);
      expect(url).toContain('auth=success');
      expect(url).toContain('type=user');
    });

    it('should generate redirect URL for tenant', () => {
      const user = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        type: 'tenant' as const,
        domain: 't4g.space',
      };

      const url = service.getRedirectUrl(user);
      expect(url).toContain('auth=success');
      expect(url).toContain('type=tenant');
    });

    it('should use custom returnTo URL', () => {
      const user = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user' as const,
        domain: 't4g.fun',
      };

      const returnTo = 'https://custom.example.com/dashboard';
      const url = service.getRedirectUrl(user, returnTo);
      expect(url).toContain(returnTo);
    });
  });
});