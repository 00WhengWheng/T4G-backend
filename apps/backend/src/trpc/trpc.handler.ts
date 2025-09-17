import { Injectable } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { TrpcRouter } from './trpc.router';
import { TrpcService, Context } from './trpc.service';
import { resolveHTTPResponse } from '@trpc/server/http';

@Injectable()
export class TrpcHandler {
  constructor(
    private readonly trpcRouter: TrpcRouter,
    private readonly trpcService: TrpcService,
  ) {}

  async applyMiddleware(app: NestFastifyApplication) {
    // Register a custom route handler for tRPC using Fastify's route registration
    const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
    
    for (const method of methods) {
      app.getHttpAdapter().getInstance().route({
        method: method as any,
        url: '/trpc/*',
        handler: async (request: any, reply: any) => {
          try {
            console.log(`tRPC ${method} request to ${request.url}`);
            
            // Parse the path correctly, removing query string
            const url = new URL(request.url, 'http://localhost');
            const urlParts = url.pathname.split('/');
            const trpcIndex = urlParts.indexOf('trpc');
            const path = urlParts.slice(trpcIndex + 1).join('.');
            
            console.log(`Parsed tRPC path: ${path}`);
            
            const createContext = async (): Promise<Context> => ({
              req: request,
            });

            const response = await resolveHTTPResponse({
              router: this.trpcRouter.appRouter,
              req: {
                method: request.method,
                headers: request.headers,
                body: request.body,
                query: new URLSearchParams(request.query as any),
              },
              path,
              createContext,
              onError: ({ path, error }) => {
                console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
              },
            });

            reply.status(response.status);
            
            for (const [key, value] of Object.entries(response.headers || {})) {
              reply.header(key, value);
            }

            reply.send(response.body);
          } catch (error) {
            console.error('tRPC handler error:', error);
            reply.status(500).send({ error: 'Internal server error' });
          }
        },
      });
    }
  }
}