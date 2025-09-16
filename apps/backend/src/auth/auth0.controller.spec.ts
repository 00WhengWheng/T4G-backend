import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Auth0Controller } from './auth0.controller';
import { Auth0Service } from './auth0.service';
import auth0Config from './auth0.config';

describe('Auth0Controller', () => {
  let controller: Auth0Controller;
  let service: Auth0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [auth0Config],
        }),
      ],
      controllers: [Auth0Controller],
      providers: [Auth0Service],
    }).compile();

    controller = module.get<Auth0Controller>(Auth0Controller);
    service = module.get<Auth0Service>(Auth0Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginUser', () => {
    it('should redirect to Auth0 user login', () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      const mockGetLoginUrl = jest.spyOn(service, 'getLoginUrl').mockReturnValue('https://example.auth0.com/authorize?...');

      controller.loginUser(undefined, mockRes);

      expect(mockGetLoginUrl).toHaveBeenCalledWith('user', undefined);
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.auth0.com/authorize?...');
    });

    it('should pass returnTo parameter', () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      const returnTo = 'https://example.com/dashboard';
      const mockGetLoginUrl = jest.spyOn(service, 'getLoginUrl').mockReturnValue('https://example.auth0.com/authorize?...');

      controller.loginUser(returnTo, mockRes);

      expect(mockGetLoginUrl).toHaveBeenCalledWith('user', returnTo);
    });
  });

  describe('loginTenant', () => {
    it('should redirect to Auth0 tenant login', () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      const mockGetLoginUrl = jest.spyOn(service, 'getLoginUrl').mockReturnValue('https://example.auth0.com/authorize?...');

      controller.loginTenant(undefined, mockRes);

      expect(mockGetLoginUrl).toHaveBeenCalledWith('tenant', undefined);
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.auth0.com/authorize?...');
    });
  });

  describe('logoutUser', () => {
    it('should redirect to Auth0 user logout', () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      const mockGetLogoutUrl = jest.spyOn(service, 'getLogoutUrl').mockReturnValue('https://example.auth0.com/v2/logout?...');

      controller.logoutUser(mockRes);

      expect(mockGetLogoutUrl).toHaveBeenCalledWith('user');
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.auth0.com/v2/logout?...');
    });
  });

  describe('logoutTenant', () => {
    it('should redirect to Auth0 tenant logout', () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      const mockGetLogoutUrl = jest.spyOn(service, 'getLogoutUrl').mockReturnValue('https://example.auth0.com/v2/logout?...');

      controller.logoutTenant(mockRes);

      expect(mockGetLogoutUrl).toHaveBeenCalledWith('tenant');
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.auth0.com/v2/logout?...');
    });
  });

  describe('getAuthStatus', () => {
    it('should return authenticated false when no user', () => {
      const mockReq = {} as any;

      const result = controller.getAuthStatus(mockReq);

      expect(result).toEqual({ authenticated: false });
    });

    it('should return authenticated true with user when authenticated', () => {
      const mockUser = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user' as const,
        domain: 't4g.fun',
      };

      const mockReq = { user: mockUser } as any;
      const mockValidateUser = jest.spyOn(service, 'validateUser').mockReturnValue(mockUser);

      const result = controller.getAuthStatus(mockReq);

      expect(mockValidateUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ authenticated: true, user: mockUser });
    });
  });

  describe('callbackUser', () => {
    it('should redirect to frontend on successful authentication', async () => {
      const mockUser = {
        id: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user' as const,
        domain: 't4g.fun',
      };

      const mockReq = { user: mockUser } as any;
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const mockValidateUser = jest.spyOn(service, 'validateUser').mockReturnValue(mockUser);
      const mockGetRedirectUrl = jest.spyOn(service, 'getRedirectUrl').mockReturnValue('https://t4g.fun?auth=success&type=user');

      await controller.callbackUser(mockReq, mockRes);

      expect(mockValidateUser).toHaveBeenCalledWith(mockUser);
      expect(mockGetRedirectUrl).toHaveBeenCalledWith(mockUser);
      expect(mockRes.redirect).toHaveBeenCalledWith('https://t4g.fun?auth=success&type=user');
    });

    it('should return 401 on authentication failure', async () => {
      const mockReq = { user: null } as any;
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const mockValidateUser = jest.spyOn(service, 'validateUser').mockReturnValue(null);

      await controller.callbackUser(mockReq, mockRes);

      expect(mockValidateUser).toHaveBeenCalledWith(null);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });
  });
});