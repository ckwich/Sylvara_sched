import { Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import {
  requireActor,
  requireManagerPermission,
  requireMutationPermission,
} from '../../http/route-helpers.js';
import type { AppDeps } from './_shared.js';

const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';

const orgSettingsPatchSchema = z
  .object({
    companyTimezone: z.string().min(1).optional(),
    sales_per_day: z.number().positive().nullable().optional(),
  })
  .refine((value) => value.companyTimezone !== undefined || value.sales_per_day !== undefined, {
    message: 'At least one field is required.',
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
      where: { deletedAt: null },
      select: {
        companyTimezone: true,
        operatingStartMinute: true,
        operatingEndMinute: true,
        salesPerDay: true,
      },
    });

    return reply.code(200).send({
      companyTimezone: settings?.companyTimezone ?? DEFAULT_TIMEZONE,
      operatingStartMinute: settings?.operatingStartMinute ?? null,
      operatingEndMinute: settings?.operatingEndMinute ?? null,
      sales_per_day: settings?.salesPerDay?.toNumber() ?? null,
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
    const wantsTimezoneUpdate = typeof (request.body as { companyTimezone?: unknown } | null)?.companyTimezone === 'string';
    if (wantsTimezoneUpdate) {
      if (!requireManagerPermission({ role: actor.actorRole, reply })) {
        return;
      }
    } else if (!requireMutationPermission({ role: actor.actorRole, reply })) {
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

    if (parsed.data.companyTimezone !== undefined && !isValidIanaTimeZone(parsed.data.companyTimezone)) {
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
          companyTimezone: parsed.data.companyTimezone ?? DEFAULT_TIMEZONE,
          salesPerDay:
            parsed.data.sales_per_day === undefined
              ? null
              : parsed.data.sales_per_day === null
                ? null
                : new Prisma.Decimal(parsed.data.sales_per_day),
        },
        update: {
          ...(parsed.data.companyTimezone !== undefined
            ? { companyTimezone: parsed.data.companyTimezone }
            : {}),
          ...(parsed.data.sales_per_day !== undefined
            ? {
                salesPerDay:
                  parsed.data.sales_per_day === null
                    ? null
                    : new Prisma.Decimal(parsed.data.sales_per_day),
              }
            : {}),
        },
        select: {
          companyTimezone: true,
          operatingStartMinute: true,
          operatingEndMinute: true,
          salesPerDay: true,
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
            ...(parsed.data.companyTimezone !== undefined
              ? { companyTimezone: settings.companyTimezone }
              : {}),
            ...(parsed.data.sales_per_day !== undefined
              ? { sales_per_day: settings.salesPerDay?.toNumber() ?? null }
              : {}),
          } as Prisma.InputJsonValue,
        },
      });

      return settings;
    });

    return reply.code(200).send({
      companyTimezone: updated.companyTimezone,
      operatingStartMinute: updated.operatingStartMinute,
      operatingEndMinute: updated.operatingEndMinute,
      sales_per_day: updated.salesPerDay?.toNumber() ?? null,
    });
  });
}
