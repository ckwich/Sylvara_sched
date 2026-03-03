import type { FastifyRequest } from 'fastify';

export function isLanModeEnabled(value: string | undefined): boolean {
  return value === 'true';
}

export function hasValidLanBearer(
  request: FastifyRequest,
  sharedSecret: string,
): boolean {
  const header = request.headers.authorization;
  if (!header) {
    return false;
  }

  return header === `Bearer ${sharedSecret}`;
}
