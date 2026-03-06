import type { FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import type { UserRole } from '@prisma/client';

export type RequestActor = {
  id: string;
  role: UserRole;
  display: string | null;
};

declare module 'fastify' {
  interface FastifyRequest {
    actor?: RequestActor;
  }
}

export const UNAUTHENTICATED_ERROR = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  },
} as const;

export class UnauthenticatedError extends Error {
  constructor() {
    super('Authentication required.');
    this.name = 'UnauthenticatedError';
  }
}

export function isUnauthenticatedError(error: unknown): error is UnauthenticatedError {
  return error instanceof UnauthenticatedError;
}

export async function requireActorUserId(
  prisma: Pick<PrismaClient, 'user'>,
  request: FastifyRequest,
): Promise<string> {
  if (!request.actor?.id) {
    throw new UnauthenticatedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: request.actor.id },
    select: { id: true, active: true },
  });

  if (!user || user.active === false) {
    throw new UnauthenticatedError();
  }

  return user.id;
}

export function getActorDisplay(request: FastifyRequest): string | null {
  return request.actor?.display ?? null;
}
