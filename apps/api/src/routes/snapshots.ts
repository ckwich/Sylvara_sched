import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  requireActor,
  requireManagerPermission,
  validationError,
} from '../http/route-helpers.js';
import { captureSnapshot } from '../services/snapshot-service.js';

type AppDeps = {
  prisma: PrismaClient;
};

const triggerBodySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

function parseDateOnlyInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (
    parsed.getUTCFullYear() !== Number(match[1]) ||
    parsed.getUTCMonth() + 1 !== Number(match[2]) ||
    parsed.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }
  return parsed;
}

export function registerSnapshotRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/snapshots/trigger', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const body = triggerBodySchema.safeParse(request.body ?? {});
    if (!body.success) {
      return validationError(reply, 'Invalid snapshot trigger payload.', body.error.flatten());
    }

    let inputDate: Date | undefined;
    if (body.data.date !== undefined) {
      const parsed = parseDateOnlyInput(body.data.date);
      if (parsed === null) {
        return validationError(reply, 'Invalid date format. Expected YYYY-MM-DD.', {});
      }
      inputDate = parsed;
    }
    const result = await captureSnapshot(deps.prisma, inputDate);
    if (result.status === 'DUPLICATE') {
      return reply.code(409).send({
        error: {
          code: 'SNAPSHOT_DUPLICATE',
          message: `A snapshot already exists for week of ${result.snapshot_date}`,
          details: {},
        },
      });
    }

    return reply.code(200).send(result);
  });
}
