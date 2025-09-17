import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User, UserRole, CreateUserDto, UpdateUserDto } from './user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        auth0Id: 'auth0|123456789',
        role: UserRole.USER,
      };

      const user = await service.createUser(createUserDto);

      expect(user).toBeDefined();
      expect(user.email).toBe(createUserDto.email);
      expect(user.name).toBe(createUserDto.name);
      expect(user.auth0Id).toBe(createUserDto.auth0Id);
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
      expect(user.preferences).toBeDefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        auth0Id: 'auth0|123456789',
      };

      await service.createUser(createUserDto);

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByAuth0Id', () => {
    it('should find user by Auth0 ID', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        auth0Id: 'auth0|123456789',
      };

      const createdUser = await service.createUser(createUserDto);
      const foundUser = await service.findByAuth0Id('auth0|123456789');

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(createdUser.id);
    });

    it('should return null if user not found', async () => {
      const foundUser = await service.findByAuth0Id('nonexistent');
      expect(foundUser).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        auth0Id: 'auth0|123456789',
      };

      const user = await service.createUser(createUserDto);
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        preferences: { theme: 'dark' },
      };

      const updatedUser = await service.updateUser(user.id, updateUserDto);

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.preferences!.theme).toBe('dark');
      expect(updatedUser.preferences!.notifications).toBe(true); // Should preserve existing
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

      await expect(service.updateUser('nonexistent', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin users with any permission', async () => {
      const createUserDto: CreateUserDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        auth0Id: 'auth0|admin123',
        role: UserRole.ADMIN,
      };

      const user = await service.createUser(createUserDto);
      
      expect(service.hasPermission(user, 'any:permission')).toBe(true);
    });

    it('should return true for users with specific permissions', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        name: 'Regular User',
        auth0Id: 'auth0|user123',
        role: UserRole.USER,
      };

      const user = await service.createUser(createUserDto);
      
      expect(service.hasPermission(user, 'read:profile')).toBe(true);
      expect(service.hasPermission(user, 'admin:users')).toBe(false);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users filtered by role', async () => {
      await service.createUser({
        email: 'user1@example.com',
        name: 'User 1',
        auth0Id: 'auth0|user1',
        role: UserRole.USER,
      });

      await service.createUser({
        email: 'admin1@example.com',
        name: 'Admin 1',
        auth0Id: 'auth0|admin1',
        role: UserRole.ADMIN,
      });

      const users = await service.getUsersByRole(UserRole.USER);
      const admins = await service.getUsersByRole(UserRole.ADMIN);

      expect(users).toHaveLength(1);
      expect(admins).toHaveLength(1);
      expect(users[0].role).toBe(UserRole.USER);
      expect(admins[0].role).toBe(UserRole.ADMIN);
    });
  });
});