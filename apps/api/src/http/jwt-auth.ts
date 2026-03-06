import type { UserRole } from '@prisma/client';
import { jwtDecrypt, jwtVerify } from 'jose';
import type { FastifyReply, FastifyRequest } from 'fastify';

type JwtAuthOptions = {
  lanSharedSecret: string | null;
  logWarning: (message: string) => void;
};

const UNAUTHORIZED_RESPONSE = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  },
} as const;

const USER_ROLE_SET = new Set<UserRole>(['MANAGER', 'SCHEDULER', 'VIEWER']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let didLogShimWarning = false;

function getHeaderValue(request: FastifyRequest, headerName: string): string | null {
  const raw = request.headers[headerName];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function isWriteMethod(method: string): boolean {
  return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase());
}

function getBearerToken(request: FastifyRequest): string | null {
  const value = getHeaderValue(request, 'authorization');
  if (!value || !value.startsWith('Bearer ')) {
    return null;
  }
  const token = value.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

async function setActorFromJwt(request: FastifyRequest, token: string, secret: string): Promise<boolean> {
  const key = new TextEncoder().encode(secret);
  let payload: Record<string, unknown> | null = null;

  try {
    const verified = await jwtVerify(token, key);
    payload = verified.payload as Record<string, unknown>;
  } catch {
    try {
      const decrypted = await jwtDecrypt(token, key);
      payload = decrypted.payload as Record<string, unknown>;
    } catch {
      return false;
    }
  }

  const actorId = typeof payload.userId === 'string' ? payload.userId : null;
  const role = typeof payload.role === 'string' ? payload.role : null;
  if (!actorId || !UUID_RE.test(actorId) || !role || !USER_ROLE_SET.has(role as UserRole)) {
    return false;
  }

  request.actor = {
    id: actorId,
    role: role as UserRole,
    display: null,
  };
  return true;
}

async function setActorFromShim(input: {
  request: FastifyRequest;
  reply: FastifyReply;
  lanSharedSecret: string;
  logWarning: (message: string) => void;
}): Promise<boolean> {
  if (!didLogShimWarning) {
    input.logWarning('Legacy x-actor-user-id/x-lan-user auth shim is active (non-production only).');
    didLogShimWarning = true;
  }

  const bearer = getBearerToken(input.request);
  if (!bearer || bearer !== input.lanSharedSecret) {
    input.reply.code(401).send(UNAUTHORIZED_RESPONSE);
    return false;
  }

  const write = isWriteMethod(input.request.method);
  const actorHeader = write ? 'x-lan-user' : 'x-actor-user-id';
  const forbiddenHeader = write ? 'x-actor-user-id' : null;
  const actorId = getHeaderValue(input.request, actorHeader);

  if (forbiddenHeader && getHeaderValue(input.request, forbiddenHeader)) {
    input.reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'x-actor-user-id is not allowed in LAN mode.',
      },
    });
    return false;
  }

  if (!actorId || !UUID_RE.test(actorId)) {
    input.reply.code(401).send(UNAUTHORIZED_RESPONSE);
    return false;
  }

  input.request.actor = {
    id: actorId,
    role: 'VIEWER',
    display: write ? actorId : null,
  };
  return true;
}

export function createJwtAuthPreHandler(options: JwtAuthOptions) {
  return async function jwtAuthPreHandler(request: FastifyRequest, reply: FastifyReply) {
    const path = request.raw.url?.split('?')[0] ?? '';
    if (!path.startsWith('/api/') || path === '/api/health') {
      return;
    }

    const jwtToken = getBearerToken(request);
    const authSecret = process.env.AUTH_SECRET?.trim();
    if (jwtToken && authSecret) {
      const ok = await setActorFromJwt(request, jwtToken, authSecret);
      if (ok) {
        return;
      }
    }

    // Test-only compatibility shim for legacy smoke/integration suites.
    // Production and normal development traffic must authenticate via JWT.
    const shimAllowed = process.env.NODE_ENV === 'test' && !!options.lanSharedSecret;
    if (shimAllowed) {
      const ok = await setActorFromShim({
        request,
        reply,
        lanSharedSecret: options.lanSharedSecret as string,
        logWarning: options.logWarning,
      });
      if (ok) {
        return;
      }
      return;
    }

    reply.code(401).send(UNAUTHORIZED_RESPONSE);
  };
}
