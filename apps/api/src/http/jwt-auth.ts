import type { UserRole } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken } from '@clerk/backend';
import { jwtVerify, importSPKI } from 'jose';

export type AuthPreHandlerOptions = {
  /** Clerk secret key — used to verify tokens via Clerk's JWKS endpoint (production). */
  secretKey?: string;
  /** PEM-encoded SPKI public key — used for local RS256 verification (tests). */
  jwtKey?: string;
};

const UNAUTHORIZED_RESPONSE = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  },
} as const;

const USER_ROLE_SET = new Set<UserRole>(['MANAGER', 'SCHEDULER', 'VIEWER']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(request: FastifyRequest): string | null {
  const raw = request.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith('Bearer ')) {
    return null;
  }
  const token = value.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

let cachedSpkiKey: Awaited<ReturnType<typeof importSPKI>> | null = null;

export function createAuthPreHandler(options: AuthPreHandlerOptions) {
  return async function authPreHandler(request: FastifyRequest, reply: FastifyReply) {
    const path = request.raw.url?.split('?')[0] ?? '';
    if (!path.startsWith('/api/') || path === '/api/health') {
      return;
    }

    const token = getBearerToken(request);
    if (!token) {
      reply.code(401).send(UNAUTHORIZED_RESPONSE);
      return;
    }

    let payload: Record<string, unknown>;
    try {
      if (options.secretKey) {
        // Production: verify via Clerk's JWKS
        payload = await verifyToken(token, { secretKey: options.secretKey }) as Record<string, unknown>;
      } else if (options.jwtKey) {
        // Test: verify locally with RSA public key
        if (!cachedSpkiKey) {
          cachedSpkiKey = await importSPKI(options.jwtKey, 'RS256');
        }
        const result = await jwtVerify(token, cachedSpkiKey);
        payload = result.payload as Record<string, unknown>;
      } else {
        reply.code(401).send(UNAUTHORIZED_RESPONSE);
        return;
      }
    } catch {
      reply.code(401).send(UNAUTHORIZED_RESPONSE);
      return;
    }

    const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
    const actorId = typeof metadata.userId === 'string' ? metadata.userId : null;
    const role = typeof metadata.role === 'string' ? metadata.role : null;

    if (!actorId || !UUID_RE.test(actorId) || !role || !USER_ROLE_SET.has(role as UserRole)) {
      reply.code(401).send(UNAUTHORIZED_RESPONSE);
      return;
    }

    request.actor = {
      id: actorId,
      role: role as UserRole,
      display: null,
    };
  };
}
