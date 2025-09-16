import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  UseGuards, 
  Req,
  ForbiddenException,
  NotFoundException 
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserRole } from './user.entity';
import { Auth0UserGuard } from '../auth/auth0.guard';
import { AuthUser } from '../auth/auth0.service';

@Controller('users')
@UseGuards(Auth0UserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: FastifyRequest & { user: AuthUser }) {
    // Only admins can create users manually, otherwise users are created via Auth0 callback
    const currentUser = await this.userService.findByAuth0Id(req.user.id);
    if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.userService.createUser(createUserDto);
  }

  @Get('profile')
  async getProfile(@Req() req: FastifyRequest & { user: AuthUser }) {
    const user = await this.userService.findByAuth0Id(req.user.id);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  @Put('profile')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto, 
    @Req() req: FastifyRequest & { user: AuthUser }
  ) {
    const user = await this.userService.findByAuth0Id(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userService.updateUser(user.id, updateUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: FastifyRequest & { user: AuthUser }) {
    const currentUser = await this.userService.findByAuth0Id(req.user.id);
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // Users can only view their own profile unless they're admin/moderator
    const targetUser = await this.userService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.id !== id && !this.userService.hasPermission(currentUser, 'admin:users')) {
      throw new ForbiddenException('Cannot view other user profiles');
    }

    return targetUser;
  }

  @Get()
  async getAllUsers(@Req() req: FastifyRequest & { user: AuthUser }) {
    const currentUser = await this.userService.findByAuth0Id(req.user.id);
    if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.userService.getAllUsers();
  }

  @Put(':id/activate')
  async activateUser(@Param('id') id: string, @Req() req: FastifyRequest & { user: AuthUser }) {
    const currentUser = await this.userService.findByAuth0Id(req.user.id);
    if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.userService.activateUser(id);
  }

  @Put(':id/deactivate')
  async deactivateUser(@Param('id') id: string, @Req() req: FastifyRequest & { user: AuthUser }) {
    const currentUser = await this.userService.findByAuth0Id(req.user.id);
    if (!currentUser || !this.userService.hasPermission(currentUser, 'admin:users')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.userService.deactivateUser(id);
  }
}