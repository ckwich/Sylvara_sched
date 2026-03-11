import { createClerkClient, type ClerkClient } from '@clerk/backend';

let _client: ClerkClient | null = null;

/**
 * Returns a lazily-initialised Clerk client singleton.
 *
 * The client is created on first call using `CLERK_SECRET_KEY` from the
 * environment.  It throws immediately if the env var is missing so callers
 * get a clear error rather than a silent auth failure.
 *
 * In smoke / integration tests the API server never calls this module
 * because the tests inject their own `TokenVerifier` and don't interact
 * with Clerk.  If you need to stub the client in tests, reset with
 * `_resetForTests()`.
 */
export function getClerkClient(): ClerkClient {
  if (_client) return _client;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'CLERK_SECRET_KEY is not set.  The Clerk client cannot be initialised.',
    );
  }

  _client = createClerkClient({ secretKey });
  return _client;
}

/** @internal test-only reset */
export function _resetForTests(): void {
  _client = null;
}
