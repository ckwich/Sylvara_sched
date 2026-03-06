import type { PrismaClient } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getActorDisplay, isUnauthenticatedError, requireActorUserId, UnauthenticatedError } from './actor.js';
import { ROLE_PERMISSIONS, type UserRole } from '@sylvara/shared';

type UnauthenticatedBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

const DEFAULT_UNAUTHENTICATED_BODY: UnauthenticatedBody = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
    details: {},
  },
};

export function parseDateOnlyUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function validationError(reply: FastifyReply, message: string, details: unknown) {
  return reply.code(400).send({
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

export function notFoundError(reply: FastifyReply, code: string, message: string) {
  return reply.code(404).send({
    error: {
      code,
      message,
      details: {},
    },
  });
}

export function requireMutationPermission(input: { role: UserRole; reply: FastifyReply }): boolean {
  if (ROLE_PERMISSIONS.canMutate(input.role)) {
    return true;
  }
  input.reply.code(403).send({
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to modify data.',
      details: {},
    },
  });
  return false;
}

export function requireManagerPermission(input: { role: UserRole; reply: FastifyReply }): boolean {
  if (ROLE_PERMISSIONS.isManager(input.role)) {
    return true;
  }
  input.reply.code(403).send({
    error: {
      code: 'FORBIDDEN',
      message: 'Manager permissions are required for this action.',
      details: {},
    },
  });
  return false;
}

export async function requireActor(input: {
  prisma: PrismaClient;
  request: FastifyRequest;
  reply: FastifyReply;
  unauthenticatedBody?: UnauthenticatedBody;
}): Promise<{ actorUserId: string; actorDisplay: string | null; actorRole: UserRole } | null> {
  try {
    const actorUserId = await requireActorUserId(input.prisma, input.request);
    const actorUser = await input.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true, active: true },
    });
    if (!actorUser || actorUser.active === false) {
      throw new UnauthenticatedError();
    }
    return {
      actorUserId,
      actorDisplay: getActorDisplay(input.request),
      actorRole: (actorUser.role ?? 'MANAGER') as UserRole,
    };
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      input.reply.code(401).send(input.unauthenticatedBody ?? DEFAULT_UNAUTHENTICATED_BODY);
      return null;
    }
    throw error;
  }
}
