import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const DEFAULT_API_URL = 'http://127.0.0.1:4000';

type ErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

function jsonError(status: number, code: string, message: string): Response {
  const body: ErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

async function handle(request: NextRequest): Promise<Response> {
  const upstreamBase = process.env.API_URL?.trim() || DEFAULT_API_URL;
  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path || !path.startsWith('/api/')) {
    return jsonError(400, 'VALIDATION_ERROR', 'path query param must start with /api/.');
  }

  // Verify the user has a valid Clerk session. userId here is Clerk's user ID
  // (always present for authenticated sessions). We don't check publicMetadata
  // here — Fastify's jwt-auth handles user resolution from the verified token.
  let clerkUserId: string | null = null;
  let rawToken: string | null = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
    if (!clerkUserId) {
      return jsonError(401, 'UNAUTHENTICATED', 'Authentication required.');
    }
    rawToken = await authResult.getToken();
  } catch {
    return jsonError(401, 'UNAUTHENTICATED', 'Authentication required.');
  }

  if (!rawToken) {
    return jsonError(401, 'UNAUTHENTICATED', 'Authentication required.');
  }

  const method = request.method.toUpperCase();
  const inboundContentType = request.headers.get('content-type');
  const outboundHeaders: Record<string, string> = {
    Authorization: `Bearer ${rawToken}`,
  };

  const hasBody = method !== 'GET' && method !== 'HEAD';
  const rawBody = hasBody ? await request.text() : null;
  if (hasBody && rawBody && inboundContentType) {
    outboundHeaders['content-type'] = inboundContentType;
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${upstreamBase}${path}`, {
      method,
      headers: outboundHeaders,
      body: hasBody && rawBody ? rawBody : undefined,
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[proxy] Upstream fetch failed:', err instanceof Error ? err.message : err);
    return jsonError(502, 'BAD_GATEWAY', 'Upstream API unreachable.');
  }

  const passthroughHeaders = new Headers();
  const responseContentType = upstreamResponse.headers.get('content-type');
  if (responseContentType) {
    passthroughHeaders.set('content-type', responseContentType);
  }

  const status = upstreamResponse.status;

  // HTTP 204 and 304 must not include a body — the Response constructor
  // throws if one is provided for these status codes.
  if (status === 204 || status === 304) {
    return new Response(null, { status, headers: passthroughHeaders });
  }

  const responseBody = await upstreamResponse.arrayBuffer();

  return new Response(responseBody, {
    status,
    headers: passthroughHeaders,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function HEAD(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function PUT(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function PATCH(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function DELETE(request: NextRequest): Promise<Response> {
  return handle(request);
}
