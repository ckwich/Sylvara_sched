import { verifyToken as clerkVerifyToken } from '@clerk/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@sylvara/shared';

export type ActorPayload = { userId: string; role: UserRole };
export type TokenVerifier = (token: string) => Promise<ActorPayload | null>;

/**
 * Resolves a Clerk user ID (from the JWT `sub` claim) to a local DB user.
 * Used as a fallback when publicMetadata (userId, role) is not set on the
 * Clerk user — e.g. when the user.created webhook hasn't run yet.
 */
export type ClerkIdResolver = (clerkId: string) => Promise<ActorPayload | null>;

const USER_ROLE_SET = new Set<string>(['MANAGER', 'SCHEDULER', 'VIEWER']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UNAUTHORIZED_RESPONSE = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
  },
} as const;

function getBearerToken(request: FastifyRequest): string | null {
  const raw = request.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function createClerkVerifier(resolveByClerkId?: ClerkIdResolver): TokenVerifier {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is required');
  }
  return async (token: string) => {
    try {
      const payload = await clerkVerifyToken(token, { secretKey });

      // Happy path: publicMetadata contains userId + role (set by user.created webhook)
      const meta = payload.publicMetadata as
        | { userId?: string; role?: string }
        | undefined;
      if (meta?.userId && UUID_RE.test(meta.userId) && meta?.role && USER_ROLE_SET.has(meta.role)) {
        return { userId: meta.userId, role: meta.role as UserRole };
      }

      // Fallback: publicMetadata is missing (webhook hasn't run or failed).
      // Look up the local user by Clerk user ID (the JWT `sub` claim).
      if (resolveByClerkId && payload.sub) {
        const resolved = await resolveByClerkId(payload.sub);
        return resolved;
      }

      return null;
    } catch {
      return null;
    }
  };
}

/**
 * Create a Fastify preHandler that verifies bearer tokens and sets request.actor.
 *
 * @param verifyToken - Optional custom verifier for testability. In production,
 *   defaults to Clerk's verifyToken with CLERK_SECRET_KEY. The middleware always
 *   runs the same code path; only the cryptographic verification is swappable.
 * @param resolveByClerkId - Optional fallback resolver for when publicMetadata
 *   is missing from the Clerk token. Looks up the local user by clerkId column.
 *   Not needed for tests (test tokens always include publicMetadata).
 */
export function createAuthPreHandler(
  verifyToken?: TokenVerifier,
  resolveByClerkId?: ClerkIdResolver,
) {
  const verify = verifyToken ?? createClerkVerifier(resolveByClerkId);
  return async function authPreHandler(request: FastifyRequest, reply: FastifyReply) {
    const path = request.raw.url?.split('?')[0] ?? '';
    if (!path.startsWith('/api/') || path === '/api/health' || path.startsWith('/api/webhooks/')) return;

    const token = getBearerToken(request);
    if (!token) {
      reply.code(401).send(UNAUTHORIZED_RESPONSE);
      return;
    }

    const actor = await verify(token);
    if (!actor) {
      reply.code(401).send(UNAUTHORIZED_RESPONSE);
      return;
    }

    request.actor = { id: actor.userId, role: actor.role, display: null };
  };
}
