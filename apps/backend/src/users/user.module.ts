import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Auth0Module } from '../auth/auth0.module';

@Module({
  imports: [Auth0Module],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}