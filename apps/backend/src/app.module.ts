import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth/auth0.module';
import { UserModule } from './users/user.module';
import { TenantModule } from './tenants/tenant.module';
import { SeedModule } from './seed/seed.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { RewardModule } from './rewards/reward.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    Auth0Module,
    UserModule,
    TenantModule,
    SeedModule,
    HealthModule,
    RewardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}