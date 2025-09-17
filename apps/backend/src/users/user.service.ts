import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, CreateUserDto, UpdateUserDto, UserRole, UserPreferences } from './user.entity';

@Injectable()
export class UserService {
  private users: Map<string, User> = new Map();

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByAuth0Id(createUserDto.auth0Id);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user: User = {
      id: this.generateId(),
      email: createUserDto.email,
      name: createUserDto.name,
      picture: createUserDto.picture,
      role: createUserDto.role || UserRole.USER,
      auth0Id: createUserDto.auth0Id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en',
        emailUpdates: true,
      },
    };

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.auth0Id === auth0Id) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser: User = {
      ...user,
      ...updateUserDto,
      preferences: updateUserDto.preferences 
        ? { ...user.preferences, ...updateUserDto.preferences }
        : user.preferences,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async deactivateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: false });
  }

  async activateUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: true });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  hasPermission(user: User, permission: string): boolean {
    // Basic permission system based on roles
    const rolePermissions = {
      [UserRole.USER]: ['read:profile', 'update:profile'],
      [UserRole.MODERATOR]: ['read:profile', 'update:profile', 'moderate:content'],
      [UserRole.ADMIN]: ['*'], // Admin has all permissions
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}