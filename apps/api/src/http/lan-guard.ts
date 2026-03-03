import type { FastifyRequest } from 'fastify';

export const MIN_LAN_SHARED_SECRET_LENGTH = 24;

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

export function isWriteMethod(method: string): boolean {
  const upper = method.toUpperCase();
  return upper === 'POST' || upper === 'PATCH' || upper === 'PUT' || upper === 'DELETE';
}

export function getLanUserHeader(request: FastifyRequest): string | null {
  const rawHeader = request.headers['x-lan-user'];
  const value = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function hasActorIdHeader(request: FastifyRequest): boolean {
  return request.headers['x-actor-user-id'] !== undefined;
}

export function isStrongLanSharedSecret(sharedSecret: string | null | undefined): boolean {
  if (!sharedSecret) {
    return false;
  }
  return sharedSecret.trim().length >= MIN_LAN_SHARED_SECRET_LENGTH;
}
