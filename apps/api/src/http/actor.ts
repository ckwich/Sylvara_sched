import type { FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';

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
): Promise<number> {
  if (process.env.NODE_ENV === 'production') {
    throw new UnauthenticatedError();
  }

  const rawHeader = request.headers['x-actor-user-id'];
  const value = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!value) {
    throw new UnauthenticatedError();
  }

  const actorUserId = Number.parseInt(value, 10);
  if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
    throw new UnauthenticatedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: { id: true },
  });

  if (!user) {
    throw new UnauthenticatedError();
  }

  return actorUserId;
}
