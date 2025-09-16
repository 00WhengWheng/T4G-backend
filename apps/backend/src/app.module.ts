import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth/auth0.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    Auth0Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}