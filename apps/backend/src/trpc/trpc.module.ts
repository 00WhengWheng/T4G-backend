import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { TrpcHandler } from './trpc.handler';
import { UserModule } from '../users/user.module';
import { TenantModule } from '../tenants/tenant.module';
import { Auth0Module } from '../auth/auth0.module';

@Module({
  imports: [UserModule, TenantModule, Auth0Module],
  providers: [TrpcService, TrpcRouter, TrpcHandler],
  exports: [TrpcService, TrpcRouter, TrpcHandler],
})
export class TrpcModule {}