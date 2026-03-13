import { Prisma, ResourceType, RosterMemberRole, type PrismaClient } from '@prisma/client';
import { isValidMinuteOfDay } from '@sylvara/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  notFoundError,
  parseDateOnlyUtc,
  requireActor,
  requireMutationPermission,
  requireManagerPermission,
  validationError,
} from '../http/route-helpers.js';

type AppDeps = {
  prisma: PrismaClient;
};

const uuidSchema = z.string().uuid();
const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => parseDateOnlyUtc(value) !== null, 'Invalid calendar date.');
const minuteOfDaySchema = z
  .number()
  .int()
  .refine((value) => isValidMinuteOfDay(value), 'Minute must be between 0 and 1439.');

const resourcesQuerySchema = z.object({
  type: z.nativeEnum(ResourceType).optional(),
  active: z.coerce.boolean().optional(),
});

const createResourceBodySchema = z.object({
  name: z.string().trim().min(1),
  resourceType: z.nativeEnum(ResourceType),
  isForeman: z.boolean().optional(),
  active: z.boolean().optional(),
  inventoryQuantity: z.number().int().min(1).optional(),
});

const updateResourceBodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    active: z.boolean().optional(),
    inventoryQuantity: z.number().int().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const resourceIdParamsSchema = z.object({
  id: uuidSchema,
});

const createHomeBaseBodySchema = z.object({
  name: z.string().trim().min(1),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  openingTime: minuteOfDaySchema.optional(),
  closingTime: minuteOfDaySchema.optional(),
});

const updateHomeBaseBodySchema = createHomeBaseBodySchema
  .partial()
  .extend({
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const foremanIdParamsSchema = z.object({
  foremanId: uuidSchema,
});
const rosterLookupQuerySchema = z.object({
  date: dateOnlySchema,
});

const createRosterBodySchema = z.object({
  date: dateOnlySchema,
  homeBaseId: uuidSchema,
  notes: z.string().optional(),
  preferredStartMinute: minuteOfDaySchema.optional(),
  preferredEndMinute: minuteOfDaySchema.optional(),
});

const rosterMemberParamsSchema = z.object({
  foremanId: uuidSchema,
  rosterKey: z.string(),
});

const createRosterMemberBodySchema = z.object({
  personResourceId: uuidSchema,
  role: z.nativeEnum(RosterMemberRole),
});

const deleteRosterMemberParamsSchema = z.object({
  foremanId: uuidSchema,
  rosterKey: z.string(),
  memberId: uuidSchema,
});

const deleteRosterParamsSchema = z.object({
  foremanId: uuidSchema,
  rosterId: uuidSchema,
});

const adminListCreateBodySchema = z.object({
  code: z.string().trim().min(1),
  label: z.string().trim().min(1),
  active: z.boolean().optional(),
});

const adminListUpdateBodySchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

const seasonalFreezeWindowCreateBodySchema = z
  .object({
    label: z.string().trim().min(1),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    notes: z.string().optional(),
    active: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    const start = parseDateOnlyUtc(value.startDate);
    const end = parseDateOnlyUtc(value.endDate);
    if (!start || !end) {
      return;
    }
    if (start.getTime() > end.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be on or after start date.',
      });
    }
  });

const seasonalFreezeWindowUpdateBodySchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    startDate: dateOnlySchema.optional(),
    endDate: dateOnlySchema.optional(),
    notes: z.string().optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided.');

function conflictError(reply: FastifyReply, code: string, message: string) {
  return reply.code(409).send({
    error: {
      code,
      message,
      details: {},
    },
  });
}

function resourceUpdateDiff(input: {
  before: { name: string; active: boolean };
  after: { name: string; active: boolean };
}) {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  if (input.before.name !== input.after.name) {
    diff.name = { from: input.before.name, to: input.after.name };
  }
  if (input.before.active !== input.after.active) {
    diff.active = { from: input.before.active, to: input.after.active };
  }
  return diff;
}

function homeBaseUpdateDiff(input: {
  before: {
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    openingMinute: number | null;
    closingMinute: number | null;
    active: boolean;
  };
  after: {
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    openingMinute: number | null;
    closingMinute: number | null;
    active: boolean;
  };
}) {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = Object.keys(input.before) as Array<keyof typeof input.before>;
  for (const key of keys) {
    if (input.before[key] !== input.after[key]) {
      diff[key] = { from: input.before[key], to: input.after[key] };
    }
  }
  return diff;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code === 'P2002'
      : typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002'
  );
}

async function findRosterByKey(input: {
  prisma: PrismaClient;
  foremanId: string;
  rosterKey: string;
}) {
  if (uuidSchema.safeParse(input.rosterKey).success) {
    return input.prisma.foremanDayRoster.findFirst({
      where: {
        id: input.rosterKey,
        foremanPersonId: input.foremanId,
        deletedAt: null,
      },
    });
  }

  const parsedDate = parseDateOnlyUtc(input.rosterKey);
  if (!parsedDate) {
    return null;
  }
  return input.prisma.foremanDayRoster.findFirst({
    where: {
      foremanPersonId: input.foremanId,
      date: parsedDate,
      deletedAt: null,
    },
  });
}

export function registerAdminRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/resources', async (request, reply) => {
    const query = resourcesQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationError(reply, 'Invalid resources query.', query.error.flatten());
    }

    const resources = await deps.prisma.resource.findMany({
      where: {
        deletedAt: null,
        ...(query.data.type ? { resourceType: query.data.type } : {}),
        ...(query.data.active !== undefined ? { active: query.data.active } : {}),
      },
      orderBy: [{ resourceType: 'asc' }, { name: 'asc' }],
    });

    return reply.code(200).send({ resources });
  });

  app.post('/api/resources', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const body = createResourceBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid resource payload.', body.error.flatten());
    }

    const payload = body.data;
    const resourceType = payload.resourceType;
    const resource = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.resource.create({
        data: {
          name: payload.name,
          resourceType,
          inventoryQuantity: resourceType === ResourceType.PERSON ? 1 : (payload.inventoryQuantity ?? 1),
          isForeman: resourceType === ResourceType.PERSON ? (payload.isForeman ?? false) : false,
          active: payload.active ?? true,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Resource',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            name: created.name,
            resourceType: created.resourceType,
            inventoryQuantity: created.inventoryQuantity,
            isForeman: created.isForeman,
            active: created.active,
          },
        },
      });
      return created;
    });

    return reply.code(201).send({ resource });
  });

  app.patch('/api/resources/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = updateResourceBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid resource update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.resource.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        active: true,
        resourceType: true,
      },
    });
    if (!existing) {
      return notFoundError(reply, 'RESOURCE_NOT_FOUND', 'Resource not found.');
    }

    const updateData: { name?: string; active?: boolean; inventoryQuantity?: number } = {};
    if (body.data.name !== undefined) {
      updateData.name = body.data.name;
    }
    if (body.data.active !== undefined) {
      updateData.active = body.data.active;
    }
    if (existing.resourceType !== ResourceType.PERSON && body.data.inventoryQuantity !== undefined) {
      updateData.inventoryQuantity = body.data.inventoryQuantity;
    }

    const resource = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.resource.update({
        where: { id: existing.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          active: true,
          resourceType: true,
          inventoryQuantity: true,
          isForeman: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      const diff = resourceUpdateDiff({
        before: { name: existing.name, active: existing.active },
        after: { name: updated.name, active: updated.active },
      });
      await tx.activityLog.create({
        data: {
          entityType: 'Resource',
          entityId: existing.id,
          actionType: 'UPDATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: diff as Prisma.InputJsonValue,
        },
      });
      return updated;
    });

    return reply.code(200).send({ resource });
  });

  app.delete('/api/resources/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = resourceIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid resource id.', params.error.flatten());
    }

    const existing = await deps.prisma.resource.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!existing) {
      return notFoundError(reply, 'RESOURCE_NOT_FOUND', 'Resource not found.');
    }

    const deletedAt = new Date();
    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.resource.update({
        where: { id: existing.id },
        data: { deletedAt },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Resource',
          entityId: existing.id,
          actionType: 'DELETED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: { deletedAt } as Prisma.InputJsonValue,
        },
      });
    });

    return reply.code(204).send();
  });

  app.get('/api/home-bases', async (_request, reply) => {
    const homeBases = await deps.prisma.homeBase.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return reply.code(200).send({ homeBases });
  });

  app.post('/api/home-bases', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const body = createHomeBaseBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid home base payload.', body.error.flatten());
    }

    const payload = body.data;
    const homeBase = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.homeBase.create({
        data: {
          name: payload.name,
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2 ?? null,
          city: payload.city,
          state: payload.state,
          postalCode: payload.postalCode,
          openingMinute: payload.openingTime ?? null,
          closingMinute: payload.closingTime ?? null,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'HomeBase',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            name: created.name,
            addressLine1: created.addressLine1,
            addressLine2: created.addressLine2,
            city: created.city,
            state: created.state,
            postalCode: created.postalCode,
            openingMinute: created.openingMinute,
            closingMinute: created.closingMinute,
          },
        },
      });
      return created;
    });

    return reply.code(201).send({ homeBase });
  });

  app.patch('/api/home-bases/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = updateHomeBaseBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid home base update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.homeBase.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        openingMinute: true,
        closingMinute: true,
        active: true,
      },
    });
    if (!existing) {
      return notFoundError(reply, 'HOME_BASE_NOT_FOUND', 'Home base not found.');
    }

    const updateData: Prisma.HomeBaseUpdateInput = {};
    if (body.data.name !== undefined) {
      updateData.name = body.data.name;
    }
    if (body.data.addressLine1 !== undefined) {
      updateData.addressLine1 = body.data.addressLine1;
    }
    if (body.data.addressLine2 !== undefined) {
      updateData.addressLine2 = body.data.addressLine2;
    }
    if (body.data.city !== undefined) {
      updateData.city = body.data.city;
    }
    if (body.data.state !== undefined) {
      updateData.state = body.data.state;
    }
    if (body.data.postalCode !== undefined) {
      updateData.postalCode = body.data.postalCode;
    }
    if (body.data.openingTime !== undefined) {
      updateData.openingMinute = body.data.openingTime;
    }
    if (body.data.closingTime !== undefined) {
      updateData.closingMinute = body.data.closingTime;
    }
    if (body.data.active !== undefined) {
      updateData.active = body.data.active;
    }

    const homeBase = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.homeBase.update({
        where: { id: existing.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          openingMinute: true,
          closingMinute: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      const diff = homeBaseUpdateDiff({
        before: existing,
        after: updated,
      });
      await tx.activityLog.create({
        data: {
          entityType: 'HomeBase',
          entityId: existing.id,
          actionType: 'UPDATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: diff as Prisma.InputJsonValue,
        },
      });
      return updated;
    });

    return reply.code(200).send({ homeBase });
  });

  app.delete('/api/home-bases/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = resourceIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid home base id.', params.error.flatten());
    }

    const existing = await deps.prisma.homeBase.findFirst({
      where: {
        id: params.data.id,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });
    if (!existing) {
      return notFoundError(reply, 'HOME_BASE_NOT_FOUND', 'Home base not found.');
    }

    const deletedAt = new Date();
    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.homeBase.update({
        where: { id: existing.id },
        data: { deletedAt },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'HomeBase',
          entityId: existing.id,
          actionType: 'DELETED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: { deletedAt: deletedAt.toISOString(), name: existing.name } as Prisma.InputJsonValue,
        },
      });
    });

    return reply.code(204).send();
  });

  app.get('/api/foremen', async (_request, reply) => {
    const foremen = await deps.prisma.resource.findMany({
      where: {
        deletedAt: null,
        resourceType: ResourceType.PERSON,
        isForeman: true,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return reply.code(200).send({ foremen });
  });

  app.get('/api/foremen/:foremanId/rosters', async (request, reply) => {
    const params = foremanIdParamsSchema.safeParse(request.params);
    const query = rosterLookupQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) {
      return validationError(reply, 'Invalid roster lookup request.', {
        params: params.success ? undefined : params.error.flatten(),
        query: query.success ? undefined : query.error.flatten(),
      });
    }

    const date = parseDateOnlyUtc(query.data.date);
    if (!date) {
      return validationError(reply, 'Invalid roster date.', {});
    }

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: params.data.foremanId,
        date,
        deletedAt: null,
      },
      select: {
        id: true,
        foremanPersonId: true,
        date: true,
        homeBaseId: true,
        preferredStartMinute: true,
        preferredEndMinute: true,
        notes: true,
      },
    });

    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found for foreman and date.');
    }

    return reply.code(200).send({ roster });
  });

  app.get('/api/foremen/:foremanId/rosters/:rosterKey', async (request, reply) => {
    const params = rosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster lookup request.', params.error.flatten());
    }

    const roster = await findRosterByKey({
      prisma: deps.prisma,
      foremanId: params.data.foremanId,
      rosterKey: params.data.rosterKey,
    });

    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found.');
    }

    return reply.code(200).send({ roster });
  });

  app.get('/api/foremen/:foremanId/rosters/:rosterKey/members', async (request, reply) => {
    const params = rosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster members lookup request.', params.error.flatten());
    }

    const roster = await findRosterByKey({
      prisma: deps.prisma,
      foremanId: params.data.foremanId,
      rosterKey: params.data.rosterKey,
    });

    if (!roster) {
      return reply.code(200).send({ members: [] });
    }

    const members = await deps.prisma.foremanDayRosterMember.findMany({
      where: {
        rosterId: roster.id,
        deletedAt: null,
      },
      select: {
        id: true,
        personResourceId: true,
        role: true,
        personResource: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return reply.code(200).send({
      members: members.map((member) => ({
        id: member.id,
        personResourceId: member.personResourceId,
        role: member.role,
        resourceName: member.personResource.name,
      })),
    });
  });

  app.post('/api/foremen/:foremanId/rosters', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = foremanIdParamsSchema.safeParse(request.params);
    const body = createRosterBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid roster payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const date = parseDateOnlyUtc(body.data.date);
    if (!date) {
      return validationError(reply, 'Invalid roster date.', {});
    }

    const foreman = await deps.prisma.resource.findFirst({
      where: {
        id: params.data.foremanId,
        deletedAt: null,
        resourceType: ResourceType.PERSON,
        isForeman: true,
      },
      select: { id: true },
    });
    if (!foreman) {
      return notFoundError(reply, 'FOREMAN_NOT_FOUND', 'Foreman not found.');
    }

    const homeBase = await deps.prisma.homeBase.findFirst({
      where: {
        id: body.data.homeBaseId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!homeBase) {
      return notFoundError(reply, 'HOME_BASE_NOT_FOUND', 'Home base not found.');
    }

    const existingRoster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: foreman.id,
        date,
        deletedAt: null,
      },
    });

    if (existingRoster) {
      return conflictError(reply, 'ROSTER_ALREADY_EXISTS', 'Roster already exists for foreman and date.');
    }

    const roster = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.foremanDayRoster.create({
        data: {
          foremanPersonId: foreman.id,
          date,
          homeBaseId: homeBase.id,
          notes: body.data.notes,
          preferredStartMinute: body.data.preferredStartMinute,
          preferredEndMinute: body.data.preferredEndMinute,
          createdByUserId: actor.actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ForemanDayRoster',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            foremanPersonId: created.foremanPersonId,
            date: body.data.date,
            homeBaseId: created.homeBaseId,
            notes: created.notes,
            preferredStartMinute: created.preferredStartMinute,
            preferredEndMinute: created.preferredEndMinute,
          },
        },
      });
      return created;
    });

    return reply.code(201).send({ roster });
  });

  app.post('/api/foremen/:foremanId/rosters/:rosterKey/members', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = rosterMemberParamsSchema.safeParse(request.params);
    const body = createRosterMemberBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid roster member payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const roster = await findRosterByKey({
      prisma: deps.prisma,
      foremanId: params.data.foremanId,
      rosterKey: params.data.rosterKey,
    });
    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found.');
    }

    const person = await deps.prisma.resource.findFirst({
      where: {
        id: body.data.personResourceId,
        resourceType: ResourceType.PERSON,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!person) {
      return notFoundError(reply, 'PERSON_RESOURCE_NOT_FOUND', 'Person resource not found.');
    }

    try {
      const member = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.foremanDayRosterMember.create({
          data: {
            rosterId: roster.id,
            date: roster.date,
            personResourceId: person.id,
            role: body.data.role,
          },
        });

        await tx.activityLog.create({
          data: {
            entityType: 'ForemanDayRosterMember',
            entityId: created.id,
            actionType: 'CREATED',
            actorUserId: actor.actorUserId,
            actorDisplay: actor.actorDisplay,
            diff: {
              rosterId: created.rosterId,
              date: roster.date.toISOString().slice(0, 10),
              personResourceId: created.personResourceId,
              role: created.role,
            },
          },
        });
        return created;
      });

      return reply.code(201).send({ member });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return conflictError(
          reply,
          'ROSTER_MEMBER_ALREADY_ASSIGNED',
          'Person resource is already assigned to another roster on that date.',
        );
      }
      throw error;
    }
  });

  app.delete('/api/foremen/:foremanId/rosters/:rosterKey/members/:memberId', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = deleteRosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster member delete request.', params.error.flatten());
    }

    const roster = await findRosterByKey({
      prisma: deps.prisma,
      foremanId: params.data.foremanId,
      rosterKey: params.data.rosterKey,
    });
    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found.');
    }

    const member = await deps.prisma.foremanDayRosterMember.findFirst({
      where: {
        id: params.data.memberId,
        rosterId: roster.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!member) {
      return notFoundError(reply, 'ROSTER_MEMBER_NOT_FOUND', 'Roster member not found.');
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.foremanDayRosterMember.update({
        where: { id: member.id },
        data: { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ForemanDayRosterMember',
          entityId: member.id,
          actionType: 'DELETED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: {
            rosterId: roster.id,
            memberId: member.id,
          },
        },
      });
    });

    return reply.code(204).send();
  });

  app.delete('/api/foremen/:foremanId/rosters/:rosterId', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = deleteRosterParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster delete request.', params.error.flatten());
    }

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        id: params.data.rosterId,
        foremanPersonId: params.data.foremanId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found.');
    }

    const deletedAt = new Date();
    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.foremanDayRoster.update({
        where: { id: roster.id },
        data: { deletedAt },
      });

      await tx.foremanDayRosterMember.updateMany({
        where: { rosterId: roster.id, deletedAt: null },
        data: { deletedAt },
      });

      await tx.segmentRosterLink.updateMany({
        where: { rosterId: roster.id, deletedAt: null },
        data: { deletedAt },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ForemanDayRoster',
          entityId: roster.id,
          actionType: 'DELETED',
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
          diff: { deletedAt } as Prisma.InputJsonValue,
        },
      });
    });

    return reply.code(204).send();
  });

  app.get('/api/admin/requirement-types', async (_request, reply) => {
    const actor = await requireActor({ request: _request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const requirementTypes = await deps.prisma.requirementType.findMany({
      where: { deletedAt: null },
      orderBy: [{ code: 'asc' }],
    });
    return reply.code(200).send({ requirementTypes });
  });

  app.post('/api/admin/requirement-types', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const body = adminListCreateBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid requirement type payload.', body.error.flatten());
    }

    try {
      const requirementType = await deps.prisma.requirementType.create({
        data: {
          code: body.data.code,
          label: body.data.label,
          active: body.data.active ?? true,
        },
      });
      return reply.code(201).send({ requirementType });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return conflictError(reply, 'REQUIREMENT_TYPE_CODE_EXISTS', 'Requirement type code already exists.');
      }
      throw error;
    }
  });

  app.patch('/api/admin/requirement-types/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = adminListUpdateBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid requirement type update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.requirementType.findFirst({
      where: { id: params.data.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return notFoundError(reply, 'REQUIREMENT_TYPE_NOT_FOUND', 'Requirement type not found.');
    }

    const requirementType = await deps.prisma.requirementType.update({
      where: { id: existing.id },
      data: {
        ...(body.data.label !== undefined ? { label: body.data.label } : {}),
        ...(body.data.active !== undefined ? { active: body.data.active } : {}),
      },
    });
    return reply.code(200).send({ requirementType });
  });

  app.get('/api/admin/blocker-reasons', async (_request, reply) => {
    const actor = await requireActor({ request: _request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const blockerReasons = await deps.prisma.blockerReason.findMany({
      where: { deletedAt: null },
      orderBy: [{ code: 'asc' }],
    });
    return reply.code(200).send({ blockerReasons });
  });

  app.post('/api/admin/blocker-reasons', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const body = adminListCreateBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid blocker reason payload.', body.error.flatten());
    }

    try {
      const blockerReason = await deps.prisma.blockerReason.create({
        data: {
          code: body.data.code,
          label: body.data.label,
          active: body.data.active ?? true,
        },
      });
      return reply.code(201).send({ blockerReason });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return conflictError(reply, 'BLOCKER_REASON_CODE_EXISTS', 'Blocker reason code already exists.');
      }
      throw error;
    }
  });

  app.patch('/api/admin/blocker-reasons/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = adminListUpdateBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid blocker reason update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.blockerReason.findFirst({
      where: { id: params.data.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return notFoundError(reply, 'BLOCKER_REASON_NOT_FOUND', 'Blocker reason not found.');
    }

    const blockerReason = await deps.prisma.blockerReason.update({
      where: { id: existing.id },
      data: {
        ...(body.data.label !== undefined ? { label: body.data.label } : {}),
        ...(body.data.active !== undefined ? { active: body.data.active } : {}),
      },
    });
    return reply.code(200).send({ blockerReason });
  });

  app.get('/api/admin/access-constraints', async (_request, reply) => {
    const actor = await requireActor({ request: _request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const accessConstraints = await deps.prisma.accessConstraint.findMany({
      where: { deletedAt: null },
      orderBy: [{ code: 'asc' }],
    });
    return reply.code(200).send({ accessConstraints });
  });

  app.post('/api/admin/access-constraints', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const body = adminListCreateBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid access constraint payload.', body.error.flatten());
    }

    try {
      const accessConstraint = await deps.prisma.accessConstraint.create({
        data: {
          code: body.data.code,
          label: body.data.label,
          active: body.data.active ?? true,
        },
      });
      return reply.code(201).send({ accessConstraint });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return conflictError(reply, 'ACCESS_CONSTRAINT_CODE_EXISTS', 'Access constraint code already exists.');
      }
      throw error;
    }
  });

  app.patch('/api/admin/access-constraints/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = adminListUpdateBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid access constraint update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.accessConstraint.findFirst({
      where: { id: params.data.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return notFoundError(reply, 'ACCESS_CONSTRAINT_NOT_FOUND', 'Access constraint not found.');
    }

    const accessConstraint = await deps.prisma.accessConstraint.update({
      where: { id: existing.id },
      data: {
        ...(body.data.label !== undefined ? { label: body.data.label } : {}),
        ...(body.data.active !== undefined ? { active: body.data.active } : {}),
      },
    });
    return reply.code(200).send({ accessConstraint });
  });

  app.get('/api/admin/seasonal-freeze-windows', async (_request, reply) => {
    const actor = await requireActor({ request: _request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const seasonalFreezeWindows = await deps.prisma.seasonalFreezeWindow.findMany({
      where: { deletedAt: null },
      orderBy: [{ startDate: 'asc' }],
    });
    return reply.code(200).send({ seasonalFreezeWindows });
  });

  app.post('/api/admin/seasonal-freeze-windows', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const body = seasonalFreezeWindowCreateBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid seasonal freeze window payload.', body.error.flatten());
    }

    const startDate = parseDateOnlyUtc(body.data.startDate);
    const endDate = parseDateOnlyUtc(body.data.endDate);
    if (!startDate || !endDate) {
      return validationError(reply, 'Invalid seasonal freeze window dates.', {});
    }

    const seasonalFreezeWindow = await deps.prisma.seasonalFreezeWindow.create({
      data: {
        label: body.data.label,
        startDate,
        endDate,
        notes: body.data.notes,
        active: body.data.active ?? true,
        createdByUserId: actor.actorUserId,
      },
    });

    return reply.code(201).send({ seasonalFreezeWindow });
  });

  app.patch('/api/admin/seasonal-freeze-windows/:id', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const params = resourceIdParamsSchema.safeParse(request.params);
    const body = seasonalFreezeWindowUpdateBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return validationError(reply, 'Invalid seasonal freeze window update payload.', {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten(),
      });
    }

    const existing = await deps.prisma.seasonalFreezeWindow.findFirst({
      where: { id: params.data.id, deletedAt: null },
      select: { id: true, startDate: true, endDate: true },
    });
    if (!existing) {
      return notFoundError(reply, 'SEASONAL_FREEZE_WINDOW_NOT_FOUND', 'Seasonal freeze window not found.');
    }

    const startDate =
      body.data.startDate !== undefined ? parseDateOnlyUtc(body.data.startDate) : existing.startDate;
    const endDate =
      body.data.endDate !== undefined ? parseDateOnlyUtc(body.data.endDate) : existing.endDate;
    if (!startDate || !endDate || startDate.getTime() > endDate.getTime()) {
      return validationError(reply, 'Invalid seasonal freeze window date range.', {});
    }

    const seasonalFreezeWindow = await deps.prisma.seasonalFreezeWindow.update({
      where: { id: existing.id },
      data: {
        ...(body.data.label !== undefined ? { label: body.data.label } : {}),
        ...(body.data.notes !== undefined ? { notes: body.data.notes } : {}),
        ...(body.data.active !== undefined ? { active: body.data.active } : {}),
        ...(body.data.startDate !== undefined ? { startDate } : {}),
        ...(body.data.endDate !== undefined ? { endDate } : {}),
      },
    });

    return reply.code(200).send({ seasonalFreezeWindow });
  });

  // --- Activity Log ---

  const activityLogQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  });

  app.get('/api/admin/activity-log', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }
    if (!requireManagerPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const query = activityLogQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationError(reply, 'Invalid activity log query.', query.error.flatten());
    }

    const { page, pageSize } = query.data;
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      deps.prisma.activityLog.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          entityType: true,
          entityId: true,
          actionType: true,
          diff: true,
          actorUserId: true,
          actorDisplay: true,
          createdAt: true,
          actorUser: {
            select: { name: true },
          },
        },
      }),
      deps.prisma.activityLog.count({ where: { deletedAt: null } }),
    ]);

    return reply.code(200).send({
      entries: entries.map((entry) => ({
        id: entry.id,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actionType: entry.actionType,
        diff: entry.diff,
        actorUserId: entry.actorUserId,
        actorDisplay: entry.actorDisplay,
        actorName: entry.actorUser?.name ?? entry.actorDisplay ?? null,
        createdAt: entry.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  });

  // --- User Management ---

  const VALID_ROLES = ['MANAGER', 'SCHEDULER', 'VIEWER'] as const;
  type ValidRole = (typeof VALID_ROLES)[number];

  app.get('/api/admin/users', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) return;
    if (!requireManagerPermission({ role: actor.actorRole, reply })) return;

    const users = await deps.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        clerkId: true,
        createdAt: true,
      },
    });

    return reply.code(200).send({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        hasClerkId: !!u.clerkId,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  });

  const updateRoleBodySchema = z.object({
    role: z.enum(VALID_ROLES),
  });

  app.patch('/api/admin/users/:id/role', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) return;
    if (!requireManagerPermission({ role: actor.actorRole, reply })) return;

    const params = uuidSchema.safeParse((request.params as { id?: string }).id);
    if (!params.success) {
      return validationError(reply, 'Invalid user ID.', params.error.flatten());
    }
    const targetUserId = params.data;

    // Self-protection: cannot change own role
    if (targetUserId === actor.actorUserId) {
      return reply.code(400).send({
        error: { code: 'SELF_MODIFICATION', message: 'You cannot change your own role.' },
      });
    }

    const body = updateRoleBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid role.', body.error.flatten());
    }
    const newRole = body.data.role;

    const targetUser = await deps.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true, role: true, clerkId: true },
    });
    if (!targetUser) {
      return notFoundError(reply, 'USER_NOT_FOUND', 'User not found.');
    }

    const oldRole = targetUser.role as string;
    if (oldRole === newRole) {
      return reply.code(200).send({ message: 'No change.', role: newRole });
    }

    // Update DB first
    await deps.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });
      await tx.activityLog.create({
        data: {
          entityType: 'User',
          entityId: targetUserId,
          actionType: 'UPDATED',
          diff: { field: 'role', from: oldRole, to: newRole },
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
        },
      });
    });

    // Sync Clerk publicMetadata — rollback DB on failure
    if (targetUser.clerkId) {
      try {
        const { getClerkClient } = await import('../lib/clerk-client.js');
        const clerk = getClerkClient();
        await clerk.users.updateUserMetadata(targetUser.clerkId, {
          publicMetadata: { userId: targetUser.id, role: newRole },
        });
      } catch (clerkErr) {
        // Rollback the DB change
        await deps.prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: targetUserId },
            data: { role: oldRole as ValidRole },
          });
          await tx.activityLog.create({
            data: {
              entityType: 'User',
              entityId: targetUserId,
              actionType: 'UPDATED',
              diff: {
                field: 'role',
                from: newRole,
                to: oldRole,
                reason: 'Clerk sync failed — rolled back',
              },
              actorUserId: actor.actorUserId,
              actorDisplay: actor.actorDisplay,
            },
          });
        });

        const msg =
          clerkErr instanceof Error ? clerkErr.message : String(clerkErr);
        return reply.code(502).send({
          error: {
            code: 'CLERK_SYNC_FAILED',
            message: `Role update rolled back: Clerk sync failed (${msg}).`,
          },
        });
      }
    }

    return reply.code(200).send({ message: 'Role updated.', role: newRole });
  });

  const updateActiveBodySchema = z.object({
    active: z.boolean(),
  });

  app.patch('/api/admin/users/:id/active', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) return;
    if (!requireManagerPermission({ role: actor.actorRole, reply })) return;

    const params = uuidSchema.safeParse((request.params as { id?: string }).id);
    if (!params.success) {
      return validationError(reply, 'Invalid user ID.', params.error.flatten());
    }
    const targetUserId = params.data;

    // Self-protection: cannot deactivate self
    if (targetUserId === actor.actorUserId) {
      return reply.code(400).send({
        error: { code: 'SELF_MODIFICATION', message: 'You cannot change your own active status.' },
      });
    }

    const body = updateActiveBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid active value.', body.error.flatten());
    }
    const newActive = body.data.active;

    const targetUser = await deps.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true, active: true },
    });
    if (!targetUser) {
      return notFoundError(reply, 'USER_NOT_FOUND', 'User not found.');
    }

    if (targetUser.active === newActive) {
      return reply.code(200).send({ message: 'No change.', active: newActive });
    }

    await deps.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { active: newActive },
      });
      await tx.activityLog.create({
        data: {
          entityType: 'User',
          entityId: targetUserId,
          actionType: 'UPDATED',
          diff: { field: 'active', from: targetUser.active, to: newActive },
          actorUserId: actor.actorUserId,
          actorDisplay: actor.actorDisplay,
        },
      });
    });

    return reply.code(200).send({
      message: newActive ? 'User activated.' : 'User deactivated.',
      active: newActive,
    });
  });
}
