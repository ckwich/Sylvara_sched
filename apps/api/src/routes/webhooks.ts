import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Webhook } from 'svix';
import { createClerkClient } from '@clerk/backend';

type AppDeps = {
  prisma: PrismaClient;
};

export function registerWebhookRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post(
    '/api/webhooks/clerk',
    {
      config: { rawBody: true },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[webhook-clerk] CLERK_WEBHOOK_SECRET not configured');
        return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured.' } });
      }

      const svixId = request.headers['svix-id'] as string | undefined;
      const svixTimestamp = request.headers['svix-timestamp'] as string | undefined;
      const svixSignature = request.headers['svix-signature'] as string | undefined;
      if (!svixId || !svixTimestamp || !svixSignature) {
        return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Missing svix headers.' } });
      }

      // Svix needs the raw request body string for signature verification.
      // Fastify parses JSON by default, so we re-serialize from the parsed body.
      const rawBody = JSON.stringify(request.body);

      const wh = new Webhook(webhookSecret);
      let event: { type: string; data: Record<string, unknown> };
      try {
        event = wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as typeof event;
      } catch (err) {
        console.error('[webhook-clerk] Signature verification failed:', err instanceof Error ? err.message : err);
        return reply.code(400).send({ error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature.' } });
      }

      if (event.type === 'user.created') {
        const { id: clerkUserId, email_addresses, first_name, last_name } = event.data as {
          id: string;
          email_addresses: Array<{ email_address: string }>;
          first_name: string | null;
          last_name: string | null;
        };

        const email = email_addresses[0]?.email_address;
        if (!email) {
          return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'No email in webhook payload.' } });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const name = [first_name, last_name].filter(Boolean).join(' ') || normalizedEmail;

        try {
          // Upsert: if a user with this email already exists (e.g. seeded), link clerkId.
          // Otherwise create a new VIEWER user.
          const existing = await deps.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, role: true, active: true, clerkId: true },
          });

          let user: { id: string; role: string };
          if (existing) {
            if (!existing.clerkId) {
              await deps.prisma.user.update({
                where: { email: normalizedEmail },
                data: { clerkId: clerkUserId },
              });
            }
            user = { id: existing.id, role: existing.role };
          } else {
            const created = await deps.prisma.user.create({
              data: {
                email: normalizedEmail,
                name: name.trim() || normalizedEmail,
                role: 'VIEWER',
                active: true,
                clerkId: clerkUserId,
              },
              select: { id: true, role: true },
            });
            user = created;
          }

          // Set publicMetadata on Clerk so subsequent JWTs include userId + role
          const secretKey = process.env.CLERK_SECRET_KEY;
          if (secretKey) {
            try {
              const clerk = createClerkClient({ secretKey });
              await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: { userId: user.id, role: user.role },
              });
            } catch (metaErr) {
              console.error('[webhook-clerk] Failed to set Clerk publicMetadata:', metaErr instanceof Error ? metaErr.message : metaErr);
              // Don't fail the webhook — the jwt-auth fallback resolver handles missing metadata
            }
          }

          console.log('[webhook-clerk] user.created processed:', { email: normalizedEmail, userId: user.id, role: user.role });
        } catch (dbErr) {
          console.error('[webhook-clerk] DB error processing user.created:', dbErr instanceof Error ? dbErr.message : dbErr);
          return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook.' } });
        }
      }

      return reply.code(200).send({ received: true });
    },
  );
}
