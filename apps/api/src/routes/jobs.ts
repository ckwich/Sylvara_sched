import { Prisma, EquipmentType, JobBlockerStatus, RequirementStatus, type PrismaClient } from '@prisma/client';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DEFAULT_TIMEZONE, parseNotes, type ParsedNotes } from '@sylvara/shared';
import {
  notFoundError,
  parseDateOnlyUtc,
  requireActor,
  requireMutationPermission,
  validationError,
} from '../http/route-helpers.js';
import { computeScheduledEffectiveHours, deriveJobState } from '../scheduling/job-state.js';

type AppDeps = {
  prisma: PrismaClient;
};

type JobHoursRow = {
  job_id: string;
  hours: number;
};

type RequirementTypeCode = ParsedNotes['requirements'][number]['typeCode'];

const uuidSchema = z.string().uuid();
const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => parseDateOnlyUtc(value) !== null, 'Invalid calendar date.');
const decimalInputSchema = z.number().finite();

const craneModelSchema = z.enum(['1090', '1060', 'EITHER']);
const includeCompletedQuerySchema = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .optional()
  .transform((value) => value === true || value === 'true');

const jobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .default(50)
    .transform((value) => Math.min(value, 200)),
  equipmentType: z.nativeEnum(EquipmentType).optional(),
  town: z.string().trim().min(1).optional(),
  salesRepCode: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  includeCompleted: includeCompletedQuerySchema.default(false),
});

const jobIdParamsSchema = z.object({
  id: uuidSchema,
});

const jobCreateBodySchema = z.object({
  customerName: z.string().trim().min(1),
  equipmentType: z.nativeEnum(EquipmentType),
  salesRepCode: z.string().min(1),
  jobSiteAddress: z.string().trim().min(1),
  town: z.string().trim().min(1),
  amountDollars: decimalInputSchema,
  estimateHoursCurrent: decimalInputSchema,
  travelHoursEstimate: decimalInputSchema.optional(),
  approvalDate: dateOnlySchema.optional(),
  approvalCall: z.string().optional(),
  notesRaw: z.string().optional(),
  winterFlag: z.boolean().optional(),
  frozenGroundFlag: z.boolean().optional(),
  craneModelSuitability: craneModelSchema.optional(),
  requiresSpiderLift: z.boolean().optional(),
});

const jobPatchBodySchema = z
  .object({
    customerName: z.string().trim().min(1).optional(),
    equipmentType: z.nativeEnum(EquipmentType).optional(),
    salesRepCode: z.string().min(1).optional(),
    jobSiteAddress: z.string().trim().min(1).optional(),
    town: z.string().trim().min(1).optional(),
    amountDollars: decimalInputSchema.optional(),
    estimateHoursCurrent: decimalInputSchema.optional(),
    travelHoursEstimate: decimalInputSchema.optional(),
    approvalDate: dateOnlySchema.optional(),
    approvalCall: z.string().optional(),
    notesRaw: z.string().optional(),
    winterFlag: z.boolean().optional(),
    frozenGroundFlag: z.boolean().optional(),
    craneModelSuitability: craneModelSchema.optional(),
    requiresSpiderLift: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const jobCompleteBodySchema = z.object({
  completedDate: dateOnlySchema,
  completionNotes: z.string().optional(),
});

function normalizeSalesRepCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function toCraneModelEnum(value: z.infer<typeof craneModelSchema> | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (value === '1090') {
    return 'MODEL_1090' as const;
  }
  if (value === '1060') {
    return 'MODEL_1060' as const;
  }
  return 'EITHER' as const;
}

function fromCraneModelEnum(
  value: 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null,
): z.infer<typeof craneModelSchema> | null {
  if (value === null) {
    return null;
  }
  if (value === 'MODEL_1090') {
    return '1090';
  }
  if (value === 'MODEL_1060') {
    return '1060';
  }
  return 'EITHER';
}

function toDecimalString(value: Prisma.Decimal | string | number | null): string | null {
  if (value === null) {
    return null;
  }
  return new Prisma.Decimal(value).toString();
}

function computeRemainingHours(
  estimateHoursCurrent: Prisma.Decimal | string | number | null,
  scheduledEffectiveHours: Prisma.Decimal,
): Prisma.Decimal | null {
  if (estimateHoursCurrent === null) {
    return null;
  }
  return new Prisma.Decimal(estimateHoursCurrent).sub(scheduledEffectiveHours);
}

async function getCompanyTimezone(prisma: PrismaClient): Promise<string> {
  const settings = await prisma.orgSettings.findFirst({
    where: { deletedAt: null },
    select: { companyTimezone: true },
  });
  return settings?.companyTimezone ?? DEFAULT_TIMEZONE;
}

async function aggregateScheduledHoursByJob(
  prisma: PrismaClient,
  jobIds: string[],
): Promise<Map<string, Prisma.Decimal>> {
  if (jobIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.$queryRaw<Array<JobHoursRow>>`
    SELECT
      job_id,
      SUM(
        CASE
          WHEN scheduled_hours_override IS NOT NULL
            THEN scheduled_hours_override
          ELSE EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0
        END
      ) AS hours
    FROM schedule_segments
    WHERE deleted_at IS NULL
      AND job_id = ANY(${jobIds}::uuid[])
    GROUP BY job_id
  `;

  return new Map(
    rows.map((row) => [
      row.job_id,
      row.hours === null ? new Prisma.Decimal(0) : new Prisma.Decimal(row.hours),
    ]),
  );
}

async function loadJobDetail(prisma: PrismaClient, jobId: string) {
  const timezone = await getCompanyTimezone(prisma);
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
      customer: {
        deletedAt: null,
      },
    },
    include: {
      customer: true,
      requirements: {
        where: { deletedAt: null },
        include: {
          requirementType: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      },
      jobBlockers: {
        where: {
          deletedAt: null,
          status: JobBlockerStatus.ACTIVE,
          blockerReason: {
            deletedAt: null,
          },
        },
        include: {
          blockerReason: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      },
      scheduleSegments: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          startDatetime: 'asc',
        },
      },
      estimateHistory: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  const scheduledEffectiveHours = computeScheduledEffectiveHours({
    timezone,
    segments: job.scheduleSegments,
  });
  const derivedState = deriveJobState({
    completedDate: job.completedDate,
    estimateHoursCurrent: job.estimateHoursCurrent,
    scheduledEffectiveHours,
  });
  const remainingHours = computeRemainingHours(job.estimateHoursCurrent, scheduledEffectiveHours);

  return {
    ...job,
    craneModelSuitability: fromCraneModelEnum(job.craneModelSuitability),
    scheduleSegments: job.scheduleSegments.map((segment) => ({
      ...segment,
      derivedState,
    })),
    scheduledEffectiveHours: scheduledEffectiveHours.toString(),
    remainingHours: remainingHours?.toString() ?? null,
    derivedState,
  };
}

function buildJobDiff(
  before: {
    customerId: string;
    equipmentType: EquipmentType;
    salesRepCode: string;
    jobSiteAddress: string;
    town: string;
    amountDollars: Prisma.Decimal;
    estimateHoursCurrent: Prisma.Decimal | null;
    travelHoursEstimate: Prisma.Decimal;
    approvalDate: Date | null;
    approvalCall: string | null;
    notesRaw: string;
    winterFlag: boolean;
    frozenGroundFlag: boolean;
    craneModelSuitability: 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null;
    requiresSpiderLift: boolean;
  },
  after: {
    customerId: string;
    equipmentType: EquipmentType;
    salesRepCode: string;
    jobSiteAddress: string;
    town: string;
    amountDollars: Prisma.Decimal;
    estimateHoursCurrent: Prisma.Decimal | null;
    travelHoursEstimate: Prisma.Decimal;
    approvalDate: Date | null;
    approvalCall: string | null;
    notesRaw: string;
    winterFlag: boolean;
    frozenGroundFlag: boolean;
    craneModelSuitability: 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null;
    requiresSpiderLift: boolean;
  },
) {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  const setIfChanged = (key: string, from: unknown, to: unknown) => {
    const fromValue =
      from instanceof Prisma.Decimal ? from.toString() : from instanceof Date ? from.toISOString() : from;
    const toValue = to instanceof Prisma.Decimal ? to.toString() : to instanceof Date ? to.toISOString() : to;
    if (fromValue !== toValue) {
      diff[key] = { from: fromValue, to: toValue };
    }
  };

  setIfChanged('customerId', before.customerId, after.customerId);
  setIfChanged('equipmentType', before.equipmentType, after.equipmentType);
  setIfChanged('salesRepCode', before.salesRepCode, after.salesRepCode);
  setIfChanged('jobSiteAddress', before.jobSiteAddress, after.jobSiteAddress);
  setIfChanged('town', before.town, after.town);
  setIfChanged('amountDollars', before.amountDollars, after.amountDollars);
  setIfChanged('estimateHoursCurrent', before.estimateHoursCurrent, after.estimateHoursCurrent);
  setIfChanged('travelHoursEstimate', before.travelHoursEstimate, after.travelHoursEstimate);
  setIfChanged('approvalDate', before.approvalDate, after.approvalDate);
  setIfChanged('approvalCall', before.approvalCall, after.approvalCall);
  setIfChanged('notesRaw', before.notesRaw, after.notesRaw);
  setIfChanged('winterFlag', before.winterFlag, after.winterFlag);
  setIfChanged('frozenGroundFlag', before.frozenGroundFlag, after.frozenGroundFlag);
  setIfChanged('craneModelSuitability', before.craneModelSuitability, after.craneModelSuitability);
  setIfChanged('requiresSpiderLift', before.requiresSpiderLift, after.requiresSpiderLift);
  return diff;
}

function scheduleEventKey(event: { eventType: string; fromAt: Date | null; toAt: Date | null; rawSnippet: string }) {
  return `${event.eventType}|${event.fromAt?.toISOString() ?? 'null'}|${event.toAt?.toISOString() ?? 'null'}|${event.rawSnippet}`;
}

export function registerJobRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/jobs', async (request, reply) => {
    const query = jobListQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationError(reply, 'Invalid jobs query.', query.error.flatten());
    }

    const normalizedSalesRepCode =
      query.data.salesRepCode !== undefined ? normalizeSalesRepCode(query.data.salesRepCode) : undefined;
    const page = query.data.page;
    const pageSize = query.data.pageSize;
    const skip = (page - 1) * pageSize;

    const where: Prisma.JobWhereInput = {
      deletedAt: null,
      customer: {
        deletedAt: null,
      },
      ...(query.data.equipmentType !== undefined ? { equipmentType: query.data.equipmentType } : {}),
      ...(query.data.town !== undefined
        ? {
            town: {
              contains: query.data.town,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(normalizedSalesRepCode !== undefined
        ? {
            salesRepCode: {
              equals: normalizedSalesRepCode,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.data.search !== undefined
        ? {
            OR: [
              {
                customer: {
                  name: {
                    contains: query.data.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                jobSiteAddress: {
                  contains: query.data.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(query.data.includeCompleted ? {} : { completedDate: null }),
    };

    const [jobs, total] = await deps.prisma.$transaction([
      deps.prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      deps.prisma.job.count({ where }),
    ]);

    const jobIds = jobs.map((job) => job.id);
    const [hoursByJobId, activeBlockers, unmetRequirements] = await Promise.all([
      aggregateScheduledHoursByJob(deps.prisma, jobIds),
      deps.prisma.jobBlocker.groupBy({
        by: ['jobId'],
        where: {
          deletedAt: null,
          status: JobBlockerStatus.ACTIVE,
          jobId: {
            in: jobIds,
          },
        },
        _count: { _all: true },
      }),
      deps.prisma.requirement.groupBy({
        by: ['jobId'],
        where: {
          deletedAt: null,
          status: {
            notIn: [RequirementStatus.APPROVED, RequirementStatus.NOT_REQUIRED],
          },
          jobId: {
            in: jobIds,
          },
        },
        _count: { _all: true },
      }),
    ]);

    const blockerCountByJobId = new Map(activeBlockers.map((row) => [row.jobId, row._count._all]));
    const unmetCountByJobId = new Map(unmetRequirements.map((row) => [row.jobId, row._count._all]));

    const rows = jobs.map((job) => {
      const scheduledEffectiveHours = hoursByJobId.get(job.id) ?? new Prisma.Decimal(0);
      const derivedState = deriveJobState({
        completedDate: job.completedDate,
        estimateHoursCurrent: job.estimateHoursCurrent,
        scheduledEffectiveHours,
      });
      const remainingHours = computeRemainingHours(job.estimateHoursCurrent, scheduledEffectiveHours);

      return {
        id: job.id,
        customerId: job.customerId,
        customerName: job.customer.name,
        equipmentType: job.equipmentType,
        salesRepCode: job.salesRepCode,
        jobSiteAddress: job.jobSiteAddress,
        town: job.town,
        amountDollars: toDecimalString(job.amountDollars),
        estimateHoursCurrent: toDecimalString(job.estimateHoursCurrent),
        scheduledEffectiveHours: scheduledEffectiveHours.toString(),
        remainingHours: remainingHours?.toString() ?? null,
        derivedState,
        completedDate: job.completedDate,
        pushUpIfPossible: job.pushUpIfPossible,
        activeBlockerCount: blockerCountByJobId.get(job.id) ?? 0,
        unmetRequirementCount: unmetCountByJobId.get(job.id) ?? 0,
      };
    });

    return reply.code(200).send({
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    });
  });

  app.get('/api/jobs/:id', async (request, reply) => {
    const params = jobIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid job id.', params.error.flatten());
    }

    const detail = await loadJobDetail(deps.prisma, params.data.id);
    if (!detail) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }

    return reply.code(200).send({ job: detail });
  });

  app.post('/api/jobs', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const body = jobCreateBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid job payload.', body.error.flatten());
    }

    const payload = body.data;
    const normalizedSalesRepCode = normalizeSalesRepCode(payload.salesRepCode);
    if (!normalizedSalesRepCode) {
      return validationError(reply, 'salesRepCode must contain at least one alphanumeric character.', {});
    }

    if (payload.equipmentType === EquipmentType.CRANE && payload.requiresSpiderLift !== undefined) {
      return validationError(reply, 'requiresSpiderLift is only valid for BUCKET jobs.', {});
    }
    if (payload.equipmentType === EquipmentType.BUCKET && payload.craneModelSuitability !== undefined) {
      return validationError(reply, 'craneModelSuitability is only valid for CRANE jobs.', {});
    }

    const approvalDate = payload.approvalDate ? parseDateOnlyUtc(payload.approvalDate) : null;

    const job = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.create({
        data: {
          name: payload.customerName.trim(),
        },
      });

      const created = await tx.job.create({
        data: {
          customerId: customer.id,
          equipmentType: payload.equipmentType,
          salesRepCode: normalizedSalesRepCode,
          jobSiteAddress: payload.jobSiteAddress,
          town: payload.town,
          amountDollars: new Prisma.Decimal(payload.amountDollars),
          estimateHoursCurrent: new Prisma.Decimal(payload.estimateHoursCurrent),
          travelHoursEstimate: new Prisma.Decimal(payload.travelHoursEstimate ?? 0),
          approvalDate,
          approvalCall: payload.approvalCall,
          notesRaw: payload.notesRaw ?? '',
          winterFlag: payload.winterFlag ?? false,
          frozenGroundFlag: payload.frozenGroundFlag ?? false,
          craneModelSuitability:
            payload.equipmentType === EquipmentType.CRANE
              ? (toCraneModelEnum(payload.craneModelSuitability) ?? null)
              : null,
          requiresSpiderLift:
            payload.equipmentType === EquipmentType.BUCKET ? (payload.requiresSpiderLift ?? false) : false,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            customerId: customer.id,
            equipmentType: created.equipmentType,
            salesRepCode: created.salesRepCode,
          },
        },
      });

      return created;
    });

    const detail = await loadJobDetail(deps.prisma, job.id);
    if (!detail) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }
    return reply.code(201).send({ job: detail });
  });

  app.patch('/api/jobs/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = jobIdParamsSchema.safeParse(request.params);
    const body = jobPatchBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid job update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.job.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: {
        id: true,
        customerId: true,
        equipmentType: true,
        salesRepCode: true,
        jobSiteAddress: true,
        town: true,
        amountDollars: true,
        estimateHoursCurrent: true,
        travelHoursEstimate: true,
        approvalDate: true,
        approvalCall: true,
        notesRaw: true,
        winterFlag: true,
        frozenGroundFlag: true,
        craneModelSuitability: true,
        requiresSpiderLift: true,
      },
    });
    if (!existing) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }

    const payload = body.data;
    const updateData: Prisma.JobUpdateInput = {};
    const shouldParseNotes = payload.notesRaw !== undefined && payload.notesRaw !== existing.notesRaw;
    const parsedNotes = shouldParseNotes ? parseNotes(payload.notesRaw ?? '') : null;

    const nextEquipmentType = payload.equipmentType ?? existing.equipmentType;
    if (payload.requiresSpiderLift !== undefined && nextEquipmentType === EquipmentType.CRANE) {
      return validationError(reply, 'requiresSpiderLift is only valid for BUCKET jobs.', {});
    }
    if (payload.craneModelSuitability !== undefined && nextEquipmentType === EquipmentType.BUCKET) {
      return validationError(reply, 'craneModelSuitability is only valid for CRANE jobs.', {});
    }

    if (payload.equipmentType !== undefined) {
      updateData.equipmentType = payload.equipmentType;
    }
    if (payload.salesRepCode !== undefined) {
      const normalizedSalesRepCode = normalizeSalesRepCode(payload.salesRepCode);
      if (!normalizedSalesRepCode) {
        return validationError(reply, 'salesRepCode must contain at least one alphanumeric character.', {});
      }
      updateData.salesRepCode = normalizedSalesRepCode;
    }
    if (payload.jobSiteAddress !== undefined) {
      updateData.jobSiteAddress = payload.jobSiteAddress;
    }
    if (payload.town !== undefined) {
      updateData.town = payload.town;
    }
    if (payload.amountDollars !== undefined) {
      updateData.amountDollars = new Prisma.Decimal(payload.amountDollars);
    }
    if (payload.estimateHoursCurrent !== undefined) {
      updateData.estimateHoursCurrent = new Prisma.Decimal(payload.estimateHoursCurrent);
    }
    if (payload.travelHoursEstimate !== undefined) {
      updateData.travelHoursEstimate = new Prisma.Decimal(payload.travelHoursEstimate);
    }
    if (payload.approvalDate !== undefined) {
      updateData.approvalDate = parseDateOnlyUtc(payload.approvalDate);
    }
    if (payload.approvalCall !== undefined) {
      updateData.approvalCall = payload.approvalCall;
    }
    if (payload.notesRaw !== undefined) {
      updateData.notesRaw = payload.notesRaw;
      if (parsedNotes) {
        updateData.notesLastParsedAt = new Date();
        updateData.notesParseConfidence = parsedNotes.confidence;
        updateData.pushUpIfPossible = parsedNotes.pushUpIfPossible;
        updateData.mustBeFirstJob = parsedNotes.mustBeFirstJob;
        updateData.noEmail = parsedNotes.noEmail;
      }
    }
    if (payload.winterFlag !== undefined) {
      updateData.winterFlag = payload.winterFlag;
    }
    if (payload.frozenGroundFlag !== undefined) {
      updateData.frozenGroundFlag = payload.frozenGroundFlag;
    }
    if (nextEquipmentType === EquipmentType.CRANE) {
      if (payload.craneModelSuitability !== undefined) {
        updateData.craneModelSuitability = toCraneModelEnum(payload.craneModelSuitability);
      }
      updateData.requiresSpiderLift = false;
    }
    if (nextEquipmentType === EquipmentType.BUCKET) {
      updateData.craneModelSuitability = null;
      if (payload.requiresSpiderLift !== undefined) {
        updateData.requiresSpiderLift = payload.requiresSpiderLift;
      }
    }

    const updatedJob = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (payload.customerName !== undefined) {
        await tx.customer.update({
          where: {
            id: existing.customerId,
          },
          data: {
            name: payload.customerName,
          },
        });
      }

      const updated = await tx.job.update({
        where: {
          id: existing.id,
        },
        data: updateData,
      });

      const amountChanged = !existing.amountDollars.eq(updated.amountDollars);
      const estimateChanged =
        existing.estimateHoursCurrent === null
          ? updated.estimateHoursCurrent !== null
          : updated.estimateHoursCurrent === null
            ? true
            : !existing.estimateHoursCurrent.eq(updated.estimateHoursCurrent);

      if (amountChanged || estimateChanged) {
        await tx.estimateHistory.create({
          data: {
            jobId: existing.id,
            changedByUserId: actor.actorUserId,
            changedAt: new Date(),
            previousAmountDollars: existing.amountDollars,
            newAmountDollars: updated.amountDollars,
            previousEstimateHours: existing.estimateHoursCurrent,
            newEstimateHours: updated.estimateHoursCurrent,
          },
        });
      }

      if (parsedNotes) {
        const detectedTypeCodes = Array.from(new Set(parsedNotes.requirements.map((requirement) => requirement.typeCode)));
        if (detectedTypeCodes.length > 0) {
          const typeCodeToDbCode: Record<RequirementTypeCode, string> = {
            POLICE_DETAIL: 'POLICE_DETAIL',
            CRANE_AND_BOOM_PERMIT: 'CRANE_AND_BOOM_PERMIT',
            TREE_PERMIT: 'TREE_PERMIT',
          };

          const requirementTypes = await tx.requirementType.findMany({
            where: {
              deletedAt: null,
              code: {
                in: detectedTypeCodes.map((typeCode) => typeCodeToDbCode[typeCode]),
              },
            },
            select: {
              id: true,
              code: true,
            },
          });

          const requirementTypeIdByCode = new Map(requirementTypes.map((type) => [type.code, type.id]));
          const existingRequirements = await tx.requirement.findMany({
            where: {
              deletedAt: null,
              jobId: existing.id,
              requirementTypeId: {
                in: requirementTypes.map((type) => type.id),
              },
            },
            select: {
              requirementTypeId: true,
            },
          });

          const existingTypeIds = new Set(existingRequirements.map((requirement) => requirement.requirementTypeId));
          const firstRequirementSnippetByCode = new Map<string, string>();
          for (const requirement of parsedNotes.requirements) {
            if (!firstRequirementSnippetByCode.has(requirement.typeCode)) {
              firstRequirementSnippetByCode.set(requirement.typeCode, requirement.rawSnippet);
            }
          }

          for (const typeCode of detectedTypeCodes) {
            const dbCode = typeCodeToDbCode[typeCode];
            const requirementTypeId = requirementTypeIdByCode.get(dbCode);
            if (!requirementTypeId || existingTypeIds.has(requirementTypeId)) {
              continue;
            }

            await tx.requirement.create({
              data: {
                jobId: existing.id,
                requirementTypeId,
                status: RequirementStatus.REQUIRED,
                source: 'LEGACY_PARSE',
                rawSnippet: firstRequirementSnippetByCode.get(typeCode),
              },
            });
          }
        }

        if (parsedNotes.scheduleEvents.length > 0) {
          const existingScheduleEvents = await tx.scheduleEvent.findMany({
            where: {
              deletedAt: null,
              jobId: existing.id,
              source: 'LEGACY_PARSE',
              eventType: {
                in: parsedNotes.scheduleEvents.map((event) => event.eventType),
              },
            },
            select: {
              eventType: true,
              fromAt: true,
              toAt: true,
              rawSnippet: true,
            },
          });

          const existingKeys = new Set(
            existingScheduleEvents.map((event) =>
              scheduleEventKey({
                eventType: event.eventType,
                fromAt: event.fromAt,
                toAt: event.toAt,
                rawSnippet: event.rawSnippet ?? '',
              }),
            ),
          );

          for (const event of parsedNotes.scheduleEvents) {
            const key = scheduleEventKey(event);
            if (existingKeys.has(key)) {
              continue;
            }

            await tx.scheduleEvent.create({
              data: {
                jobId: existing.id,
                eventType: event.eventType,
                source: 'LEGACY_PARSE',
                fromAt: event.fromAt,
                toAt: event.toAt,
                rawSnippet: event.rawSnippet,
              },
            });
          }
        }

        await tx.activityLog.create({
          data: {
            entityType: 'Job',
            entityId: existing.id,
            actionType: 'NOTE_PARSED',
            actorUserId: actor.actorUserId,
            actorDisplay: actor.actorDisplay,
            diff: {
              detectedFlags: [
                ...(parsedNotes.pushUpIfPossible ? ['pushUpIfPossible'] : []),
                ...(parsedNotes.mustBeFirstJob ? ['mustBeFirstJob'] : []),
                ...(parsedNotes.noEmail ? ['noEmail'] : []),
                ...(parsedNotes.ditchWitchSuggested ? ['ditchWitchSuggested'] : []),
              ],
              detectedRequirements: parsedNotes.requirements.map((requirement) => requirement.typeCode),
              scheduleEvents: parsedNotes.scheduleEvents.map((event) => ({
                eventType: event.eventType,
                fromAt: event.fromAt ? event.fromAt.toISOString() : null,
                toAt: event.toAt ? event.toAt.toISOString() : null,
                rawSnippet: event.rawSnippet,
              })),
            },
          },
        });
      }

      const diff = buildJobDiff(existing, updated);
      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: existing.id,
          actionType: 'UPDATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: diff as Prisma.InputJsonValue,
        },
      });
      return updated;
    });

    const detail = await loadJobDetail(deps.prisma, updatedJob.id);
    if (!detail) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }
    return reply.code(200).send({ job: detail });
  });

  app.post('/api/jobs/:id/complete', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = jobIdParamsSchema.safeParse(request.params);
    const body = jobCompleteBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid complete payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const completedDate = parseDateOnlyUtc(body.data.completedDate);
    if (!completedDate) {
      return validationError(reply, 'Invalid completedDate.', {});
    }

    const existing = await deps.prisma.job.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: {
        id: true,
        completedDate: true,
      },
    });
    if (!existing) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.job.update({
        where: {
          id: existing.id,
        },
        data: {
          completedDate,
          completionNotes: body.data.completionNotes,
          completedByUserId: actor.actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: existing.id,
          actionType: 'STATE_CHANGED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            completedDate: {
              from: existing.completedDate ? existing.completedDate.toISOString() : null,
              to: completedDate.toISOString(),
            },
          },
        },
      });
    });

    const detail = await loadJobDetail(deps.prisma, existing.id);
    if (!detail) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }
    return reply.code(200).send({ job: detail });
  });

  app.post('/api/jobs/:id/uncomplete', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = jobIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid job id.', params.error.flatten());
    }

    const existing = await deps.prisma.job.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: {
        id: true,
        completedDate: true,
      },
    });
    if (!existing) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.job.update({
        where: {
          id: existing.id,
        },
        data: {
          completedDate: null,
          completedByUserId: null,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: existing.id,
          actionType: 'STATE_CHANGED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            completedDate: {
              from: existing.completedDate ? existing.completedDate.toISOString() : null,
              to: null,
            },
          },
        },
      });
    });

    const detail = await loadJobDetail(deps.prisma, existing.id);
    if (!detail) {
      return notFoundError(reply, 'JOB_NOT_FOUND', 'Job not found.');
    }
    return reply.code(200).send({ job: detail });
  });
}
