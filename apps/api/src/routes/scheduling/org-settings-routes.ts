import { Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import { requireActor, requireManagerPermission } from '../../http/route-helpers.js';
import type { AppDeps } from './_shared.js';

const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';

const orgSettingsPatchSchema = z.object({
  companyTimezone: z.string().min(1),
});

function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function registerOrgSettingsRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/org-settings', async (_request, reply) => {
    const settings = await deps.prisma.orgSettings.findFirst({
      select: {
        companyTimezone: true,
        operatingStartMinute: true,
        operatingEndMinute: true,
      },
    });

    return reply.code(200).send({
      companyTimezone: settings?.companyTimezone ?? DEFAULT_TIMEZONE,
      operatingStartMinute: settings?.operatingStartMinute ?? null,
      operatingEndMinute: settings?.operatingEndMinute ?? null,
    });
  });

  app.patch('/api/org-settings', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;

    const parsed = orgSettingsPatchSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid org settings payload.',
          details: parsed.error.flatten(),
        },
      });
    }

    if (!isValidIanaTimeZone(parsed.data.companyTimezone)) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid company timezone.',
          details: {},
        },
      });
    }

    const updated = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const settings = await tx.orgSettings.upsert({
        where: { id: ORG_SETTINGS_ID },
        create: {
          id: ORG_SETTINGS_ID,
          companyTimezone: parsed.data.companyTimezone,
        },
        update: {
          companyTimezone: parsed.data.companyTimezone,
        },
        select: {
          companyTimezone: true,
          operatingStartMinute: true,
          operatingEndMinute: true,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'OrgSettings',
          entityId: ORG_SETTINGS_ID,
          actionType: 'UPDATED',
          actorUserId,
          actorDisplay,
          diff: {
            companyTimezone: settings.companyTimezone,
          },
        },
      });

      return settings;
    });

    return reply.code(200).send({
      companyTimezone: updated.companyTimezone,
      operatingStartMinute: updated.operatingStartMinute,
      operatingEndMinute: updated.operatingEndMinute,
    });
  });
}
