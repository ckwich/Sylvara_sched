import { PreferredChannel, Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import { requireActor, requireMutationPermission } from '../../http/route-helpers.js';
import type { AppDeps } from './_shared.js';
import { uuidSchema } from './_shared.js';

const preferredChannelsSchema = z.object({
  channels: z.array(z.nativeEnum(PreferredChannel)).max(3),
});

export function registerPreferredChannelsRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/jobs/:jobId/preferred-channels', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;

    const paramsSchema = z.object({
      jobId: uuidSchema,
    });
    const params = paramsSchema.safeParse(request.params);
    const body = preferredChannelsSchema.safeParse(request.body);

    if (!params.success || !body.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid preferred channels payload.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            body: body.success ? undefined : body.error.flatten(),
          },
        },
      });
    }

    const job = await deps.prisma.job.findUnique({
      where: { id: params.data.jobId },
      select: { id: true },
    });
    if (!job) {
      return reply.code(404).send({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found.',
          details: {},
        },
      });
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.jobPreferredChannel.deleteMany({
        where: { jobId: params.data.jobId },
      });

      if (body.data.channels.length > 0) {
        await tx.jobPreferredChannel.createMany({
          data: body.data.channels.map((channel) => ({
            jobId: params.data.jobId,
            channel,
          })),
        });
      }

      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: params.data.jobId,
          actionType: 'UPDATED',
          actorUserId,
          actorDisplay,
          diff: {
            preferredChannels: body.data.channels,
          },
        },
      });
    });

    return reply.code(200).send({
      ok: true,
      channels: body.data.channels,
    });
  });
}
