import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello from Tag 4 Gift Admin API powered by NestJS + Fastify!"', () => {
      expect(appController.getHello()).toBe('Hello from Tag 4 Gift Admin API powered by NestJS + Fastify!');
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const health = appController.getHealth();
      expect(health.status).toBe('OK');
      expect(health.timestamp).toBeDefined();
    });
  });
});