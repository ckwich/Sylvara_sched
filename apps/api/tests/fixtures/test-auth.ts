import { SignJWT, jwtVerify } from 'jose';
import type { TokenVerifier } from '../../src/http/jwt-auth.js';

const TEST_SECRET = new TextEncoder().encode(
  'test-signing-key-for-smoke-tests-must-be-32-chars-minimum',
);

/**
 * Creates a TokenVerifier that validates tokens signed with the test secret.
 * Inject this into buildServer for smoke/integration tests.
 */
export function createTestVerifier(): TokenVerifier {
  return async (token: string) => {
    try {
      const { payload } = await jwtVerify(token, TEST_SECRET);
      const meta = payload.publicMetadata as
        | { userId?: string; role?: string }
        | undefined;
      if (!meta?.userId || !meta?.role) return null;
      return { userId: meta.userId, role: meta.role as 'MANAGER' | 'SCHEDULER' | 'VIEWER' };
    } catch {
      return null;
    }
  };
}

export async function signTestToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ publicMetadata: { userId, role } })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

// Pre-signed token cache — warmed by vitest setupFile so tests stay synchronous
const tokenCache = new Map<string, string>();

/**
 * Returns auth headers for a test user. Synchronous — requires warmTokenCache()
 * to have been called first (done in the vitest setupFile).
 */
export function testAuthHeaders(
  userId: string,
  role: string = 'MANAGER',
): Record<string, string> {
  const key = `${userId}:${role}`;
  const cached = tokenCache.get(key);
  if (cached) return { authorization: `Bearer ${cached}` };
  throw new Error(
    `No pre-signed token for ${key}. Add it to COMMON_TEST_USERS in test-env.ts.`,
  );
}

export async function warmTokenCache(
  entries: Array<{ userId: string; role: string }>,
): Promise<void> {
  for (const entry of entries) {
    const token = await signTestToken(entry.userId, entry.role);
    tokenCache.set(`${entry.userId}:${entry.role}`, token);
  }
}
