import type { NextRequest } from 'next/server';

type RouteContext = {
  params: {
    path: string[];
  };
};

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const apiPort = process.env.API_PORT ?? '4000';
  const lanMode = process.env.LAN_MODE === 'true';
  const sharedSecret = process.env.LAN_SHARED_SECRET;

  if (lanMode && !sharedSecret) {
    return Response.json(
      { error: { code: 'SERVER_MISCONFIG', message: 'LAN_SHARED_SECRET is required in LAN mode.' } },
      { status: 500 },
    );
  }

  const path = context.params.path.join('/');
  const targetUrl = new URL(`http://127.0.0.1:${apiPort}/api/${path}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  if (lanMode && sharedSecret) {
    headers.set('authorization', `Bearer ${sharedSecret}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (!METHODS_WITHOUT_BODY.has(request.method.toUpperCase())) {
    init.body = request.body;
  }

  const upstream = await fetch(targetUrl, init);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}
