import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    
    app.setGlobalPrefix('api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/api (GET)', () => {
    return app
      .inject({
        method: 'GET',
        url: '/api',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.payload).toContain('Hello from Tag 4 Gift Admin API powered by NestJS + Fastify!');
      });
  });

  it('/api/health (GET)', () => {
    return app
      .inject({
        method: 'GET',
        url: '/api/health',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        const response = JSON.parse(result.payload);
        expect(response.status).toBe('OK');
        expect(response.timestamp).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});