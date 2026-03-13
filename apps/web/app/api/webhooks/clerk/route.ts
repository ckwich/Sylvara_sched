import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClerkClient } from '@clerk/backend';
import { upsertUserOnSignIn } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 401 });
  }

  const body = await request.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return new Response('Invalid signature', { status: 401 });
  }

  if (event.type === 'user.created') {
    const { id: clerkUserId, email_addresses, first_name, last_name } = event.data as {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name: string | null;
      last_name: string | null;
    };
    const email = email_addresses[0]?.email_address;
    if (!email) return new Response('No email', { status: 400 });
    const name = [first_name, last_name].filter(Boolean).join(' ') || email;

    const user = await upsertUserOnSignIn(email, name, clerkUserId);

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error('[webhook-clerk] CLERK_SECRET_KEY not set — cannot update publicMetadata');
      return new Response('Server misconfigured', { status: 500 });
    }
    try {
      const clerk = createClerkClient({ secretKey });
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { userId: user.id, role: user.role },
      });
    } catch (err) {
      console.error('[webhook-clerk] Failed to set Clerk publicMetadata:', err instanceof Error ? err.message : err);
      return new Response('Failed to update user metadata', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}
