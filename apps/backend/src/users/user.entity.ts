export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  auth0Id: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences?: UserPreferences;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  emailUpdates: boolean;
}

export interface CreateUserDto {
  email: string;
  name: string;
  picture?: string;
  auth0Id: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  picture?: string;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
}