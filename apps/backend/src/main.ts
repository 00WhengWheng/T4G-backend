import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable CORS for both frontend domains
  app.enableCors({
    origin: [
      'https://t4g.fun',
      'https://t4g.space',
      'http://localhost:3000', // for development
      'http://localhost:3001', // for development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`🔐 Auth0 User Login: http://localhost:${port}/api/auth/login/user`);
  console.log(`🔐 Auth0 Tenant Login: http://localhost:${port}/api/auth/login/tenant`);
}

bootstrap();