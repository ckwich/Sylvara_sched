function requireLanSharedSecret(): string {
  const lanSharedSecret = process.env.LAN_SHARED_SECRET?.trim();
  if (!lanSharedSecret) {
    throw new Error('LAN_SHARED_SECRET is required for LAN test auth headers.');
  }
  return lanSharedSecret;
}

export function lanAuthHeaders(method: string, actorUserId: string): Record<string, string> {
  const upperMethod = method.toUpperCase();
  const headers: Record<string, string> = {
    authorization: `Bearer ${requireLanSharedSecret()}`,
  };

  if (upperMethod === 'GET' || upperMethod === 'HEAD') {
    headers['x-actor-user-id'] = actorUserId;
  } else {
    headers['x-lan-user'] = actorUserId;
  }

  return headers;
}

