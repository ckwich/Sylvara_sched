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

  const { getToken, sessionClaims } = await auth();
  const meta = sessionClaims?.publicMetadata as { userId?: string } | undefined;
  if (!meta?.userId) {
    return jsonError(401, 'UNAUTHENTICATED', 'Authentication required.');
  }

  const rawToken = await getToken();
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

  const upstreamResponse = await fetch(`${upstreamBase}${path}`, {
    method,
    headers: outboundHeaders,
    body: hasBody && rawBody ? rawBody : undefined,
    cache: 'no-store',
  });

  const passthroughHeaders = new Headers();
  const responseContentType = upstreamResponse.headers.get('content-type');
  if (responseContentType) {
    passthroughHeaders.set('content-type', responseContentType);
  }

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
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
