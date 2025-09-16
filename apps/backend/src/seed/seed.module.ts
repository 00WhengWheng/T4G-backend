import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UserModule } from '../users/user.module';
import { TenantModule } from '../tenants/tenant.module';

@Module({
  imports: [UserModule, TenantModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}