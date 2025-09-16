import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from Tag 4 Gift Admin API powered by NestJS + Fastify!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}