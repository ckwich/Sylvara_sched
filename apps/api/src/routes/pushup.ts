import { Prisma, SegmentType, type PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, localDateMinuteToUtc, utcToLocalDateStr, utcToLocalParts } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UNAUTHENTICATED_ERROR } from '../http/actor.js';
import { requireActor, requireMutationPermission } from '../http/route-helpers.js';
import { getCandidates } from '../services/pushup-service.js';
import { crossesLocalMidnight, hasActiveBookingConflict, isTenMinuteBoundary } from './scheduling/_shared.js';

type AppDeps = {
  prisma: PrismaClient;
};

const pushupCandidatesQuerySchema = z.object({
  vacatedSlotId: z.string().uuid(),
});

const pushupApplyBodySchema = z.object({
  vacatedSlotId: z.string().uuid(),
  jobId: z.string().uuid(),
  allocatedHours: z.number().positive(),
  startDatetime: z.string().datetime({ offset: true }),
});

const pushupDismissBodySchema = z.object({
  vacatedSlotId: z.string().uuid(),
});

function reject(code: string, message: string, details: Record<string, unknown> = {}) {
  return {
    result: 'REJECT' as const,
    rejection: {
      code,
      message,
      details,
    },
  };
}

function snapStartToTenMinuteBoundary(startUtc: Date, timezone: string): Date {
  const local = utcToLocalParts(startUtc, timezone);
  const snappedMinute = Math.floor(local.minute / 10) * 10;
  const dateIso = utcToLocalDateStr(startUtc, timezone);
  return localDateMinuteToUtc(dateIso, local.hour * 60 + snappedMinute, timezone);
}

export function registerPushupRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/pushup/candidates', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }

    const parsed = pushupCandidatesQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'vacatedSlotId is required and must be a UUID.',
          details: parsed.error.flatten(),
        },
      });
    }

    const result = await getCandidates(deps.prisma, parsed.data.vacatedSlotId);
    if (!result) {
      return reply.code(404).send({
        error: {
          code: 'VACATED_SLOT_NOT_FOUND',
          message: 'Vacated slot not found.',
          details: {},
        },
      });
    }

    return reply.code(200).send({
      vacatedSlot: {
        id: result.vacatedSlot.id,
        startDatetime: result.vacatedSlot.startDatetime,
        endDatetime: result.vacatedSlot.endDatetime,
        slotHours: Number(result.vacatedSlot.slotHours.toString()),
        equipmentType: result.vacatedSlot.equipmentType,
        status: result.vacatedSlot.status,
      },
      candidates: result.candidates,
    });
  });

  app.post('/api/pushup/apply', async (request, reply) => {
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

    const parsed = pushupApplyBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid push-up apply body.',
          details: parsed.error.flatten(),
        },
      });
    }

    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;

    const [orgSettings, slot, job] = await Promise.all([
      deps.prisma.orgSettings.findFirst({ where: { deletedAt: null }, select: { companyTimezone: true } }),
      deps.prisma.vacatedSlot.findFirst({
        where: { id: parsed.data.vacatedSlotId, deletedAt: null },
        select: {
          id: true,
          sourceSegmentId: true,
          startDatetime: true,
          endDatetime: true,
          slotHours: true,
          equipmentType: true,
          status: true,
        },
      }),
      deps.prisma.job.findFirst({
        where: { id: parsed.data.jobId, deletedAt: null },
        select: {
          id: true,
          completedDate: true,
          equipmentType: true,
        },
      }),
    ]);

    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;

    if (!slot) {
      return reply.code(404).send({
        error: { code: 'VACATED_SLOT_NOT_FOUND', message: 'Vacated slot not found.', details: {} },
      });
    }
    if (slot.status !== 'OPEN') {
      return reply.code(200).send(reject('SLOT_NOT_OPEN', 'Vacated slot is not open.'));
    }
    if (!job || job.completedDate) {
      return reply.code(200).send(reject('JOB_NOT_ELIGIBLE', 'Job is not eligible for push-up apply.'));
    }
    if (job.equipmentType !== slot.equipmentType) {
      return reply.code(200).send(reject('EQUIPMENT_MISMATCH', 'Job equipment type does not match slot.'));
    }

    const requestedStart = new Date(parsed.data.startDatetime);
    if (Number.isNaN(requestedStart.getTime())) {
      return reply.code(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid startDatetime.', details: {} },
      });
    }

    const snappedStart = snapStartToTenMinuteBoundary(requestedStart, timezone);
    if (!isTenMinuteBoundary(snappedStart, timezone)) {
      return reply.code(200).send(reject('INVALID_INCREMENT', 'Start must align to 10-minute increments.'));
    }

    const allocatedHoursDecimal = new Prisma.Decimal(parsed.data.allocatedHours);
    if (allocatedHoursDecimal.lte(0) || allocatedHoursDecimal.gt(slot.slotHours)) {
      return reply.code(200).send(reject('INVALID_ALLOCATED_HOURS', 'allocatedHours must be > 0 and <= slot hours.'));
    }

    const allocatedMinutes = Math.ceil(parsed.data.allocatedHours * 60 / 10) * 10;
    const endMs = snappedStart.getTime() + allocatedMinutes * 60_000;
    const snappedEnd = new Date(endMs);

    if (snappedStart < slot.startDatetime || snappedStart > slot.endDatetime) {
      return reply.code(200).send(reject('OUTSIDE_SLOT', 'Start datetime must be inside vacated slot window.'));
    }
    if (snappedEnd > slot.endDatetime) {
      return reply.code(200).send(reject('OUTSIDE_SLOT', 'Allocated block extends past vacated slot window.'));
    }
    if (crossesLocalMidnight(snappedStart, snappedEnd, timezone)) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'Block would run past midnight.'));
    }

    const sourceSegment = await deps.prisma.scheduleSegment.findFirst({
      where: { id: slot.sourceSegmentId },
      select: {
        id: true,
        segmentRosterLink: {
          select: {
            rosterId: true,
            roster: {
              select: {
                foremanPersonId: true,
                date: true,
              },
            },
          },
        },
      },
    });

    if (sourceSegment?.segmentRosterLink) {
      const hasConflict = await hasActiveBookingConflict({
        prisma: deps.prisma,
        foremanPersonId: sourceSegment.segmentRosterLink.roster.foremanPersonId,
        serviceDate: sourceSegment.segmentRosterLink.roster.date,
        startDatetime: snappedStart,
        endDatetime: snappedEnd,
      });
      if (hasConflict) {
        return reply.code(200).send(reject('OVERLAP_CONFLICT', 'This time overlaps an existing job.'));
      }
    }

    const created = await deps.prisma.$transaction(async (tx) => {
      const segment = await tx.scheduleSegment.create({
        data: {
          jobId: job.id,
          segmentType: SegmentType.PRIMARY,
          startDatetime: snappedStart,
          endDatetime: snappedEnd,
          createdByUserId: actorUserId,
        },
      });

      if (sourceSegment?.segmentRosterLink) {
        await tx.segmentRosterLink.create({
          data: {
            scheduleSegmentId: segment.id,
            rosterId: sourceSegment.segmentRosterLink.rosterId,
            createdByUserId: actorUserId,
          },
        });
      }

      await tx.vacatedSlot.update({
        where: { id: slot.id },
        data: {
          status: 'USED',
          chosenJobId: job.id,
          chosenSegmentId: segment.id,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'VacatedSlot',
          entityId: slot.id,
          actionType: 'PUSHUP_APPLIED',
          actorUserId,
          actorDisplay,
          diff: {
            jobId: job.id,
            segmentId: segment.id,
            startDatetime: snappedStart.toISOString(),
            endDatetime: snappedEnd.toISOString(),
            allocatedHours: parsed.data.allocatedHours,
          },
        },
      });

      return segment;
    });

    return reply.code(200).send({
      result: 'ACCEPT',
      warnings: [],
      segment: created,
      vacatedSlotId: slot.id,
    });
  });

  app.post('/api/pushup/dismiss', async (request, reply) => {
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

    const parsed = pushupDismissBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid push-up dismiss body.',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await deps.prisma.vacatedSlot.findFirst({
      where: { id: parsed.data.vacatedSlotId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return reply.code(404).send({
        error: { code: 'VACATED_SLOT_NOT_FOUND', message: 'Vacated slot not found.', details: {} },
      });
    }

    const dismissedAt = new Date();
    await deps.prisma.$transaction(async (tx) => {
      await tx.vacatedSlot.update({
        where: { id: existing.id },
        data: {
          status: 'DISMISSED',
          dismissedAt,
          dismissedByUserId: actor.actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'VacatedSlot',
          entityId: existing.id,
          actionType: 'PUSHUP_DISMISSED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            dismissedAt: dismissedAt.toISOString(),
          },
        },
      });
    });

    return reply.code(200).send({ ok: true });
  });

  app.get('/api/pushup/open', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }

    const slots = await deps.prisma.vacatedSlot.findMany({
      where: {
        deletedAt: null,
        status: 'OPEN',
      },
      orderBy: [{ startDatetime: 'asc' }],
      select: {
        id: true,
        startDatetime: true,
        endDatetime: true,
        slotHours: true,
        equipmentType: true,
        status: true,
      },
    });

    return reply.code(200).send(
      slots.map((slot) => ({
        id: slot.id,
        startDatetime: slot.startDatetime,
        endDatetime: slot.endDatetime,
        slotHours: Number(slot.slotHours.toString()),
        equipmentType: slot.equipmentType,
        status: slot.status,
      })),
    );
  });
}
