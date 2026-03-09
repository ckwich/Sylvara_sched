import { createSign } from 'node:crypto';

/**
 * Generate a Bearer token and auth headers for smoke tests.
 *
 * Creates a short-lived RS256 JWT with { metadata: { userId, role } } in the
 * payload — the same claim structure Clerk session tokens use when publicMetadata
 * is included via the session token template.
 *
 * The token is verified by the Fastify auth middleware using the TEST_JWT_PUBLIC_KEY
 * set in test-env.ts (local SPKI verification, no Clerk API call).
 *
 * @param _method  HTTP method (ignored — kept for call-site compatibility with former lanAuthHeaders)
 * @param userId   UUID of the actor
 * @param role     UserRole — defaults to MANAGER for maximum test permissions
 */
export function testAuthHeaders(
  _method: string,
  userId: string,
  role: string = 'MANAGER',
): Record<string, string> {
  return {
    authorization: `Bearer ${createTestToken(userId, role)}`,
  };
}

function createTestToken(userId: string, role: string): string {
  const privateKey = process.env.TEST_JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('TEST_JWT_PRIVATE_KEY not set. Ensure vitest setupFiles includes test-env.ts.');
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'user_test',
      metadata: { userId, role },
      iat: now,
      exp: now + 300,
    }),
  ).toString('base64url');

  const signer = createSign('SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(privateKey, 'base64url');

  return `${header}.${payload}.${signature}`;
}
