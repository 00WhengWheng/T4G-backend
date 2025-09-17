import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';
import { FastifyRequest } from 'fastify';
import { Auth0Service, AuthUser } from '../auth/auth0.service';

export interface Context {
  req: FastifyRequest;
  user?: AuthUser;
}

@Injectable()
export class TrpcService {
  constructor(private readonly auth0Service: Auth0Service) {}

  trpc = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });

  procedure = this.trpc.procedure;
  router = this.trpc.router;
  middleware = this.trpc.middleware;

  // Authentication middleware for users (t4g.fun)
  isUserAuthenticated = this.middleware(async ({ ctx, next }) => {
    if (!ctx.req.headers.authorization) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No authorization header provided',
      });
    }

    try {
      const token = ctx.req.headers.authorization.replace('Bearer ', '');
      const user = await this.auth0Service.verifyToken(token);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        });
      }

      return next({
        ctx: {
          ...ctx,
          user,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
      });
    }
  });

  // Authentication middleware for tenants (t4g.space)
  isTenantAuthenticated = this.middleware(async ({ ctx, next }) => {
    if (!ctx.req.headers.authorization) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No authorization header provided',
      });
    }

    try {
      const token = ctx.req.headers.authorization.replace('Bearer ', '');
      const user = await this.auth0Service.verifyToken(token);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        });
      }

      // Check if user is a tenant
      if (!user.app_metadata?.domain || user.app_metadata.domain !== 't4g.space') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied for this domain',
        });
      }

      return next({
        ctx: {
          ...ctx,
          user,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
      });
    }
  });

  // Protected procedures
  userProcedure = this.procedure.use(this.isUserAuthenticated);
  tenantProcedure = this.procedure.use(this.isTenantAuthenticated);
}