import { Prisma, ResourceType, RosterMemberRole, type PrismaClient } from '@prisma/client';
import { isValidMinuteOfDay } from '@sylvara/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getActorDisplay, isUnauthenticatedError, requireActorUserId } from '../http/actor.js';

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
});

const createResourceBodySchema = z.object({
  name: z.string().trim().min(1),
  resourceType: z.nativeEnum(ResourceType),
  isForeman: z.boolean().optional(),
  active: z.boolean().optional(),
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

const createRosterBodySchema = z.object({
  date: dateOnlySchema,
  homeBaseId: uuidSchema,
  notes: z.string().optional(),
  preferredStartMinute: minuteOfDaySchema.optional(),
  preferredEndMinute: minuteOfDaySchema.optional(),
});

const rosterMemberParamsSchema = z.object({
  foremanId: uuidSchema,
  date: dateOnlySchema,
});

const createRosterMemberBodySchema = z.object({
  personResourceId: uuidSchema,
  role: z.nativeEnum(RosterMemberRole),
});

const deleteRosterMemberParamsSchema = z.object({
  foremanId: uuidSchema,
  date: dateOnlySchema,
  personResourceId: uuidSchema,
});

function parseDateOnlyUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function validationError(reply: FastifyReply, message: string, details: unknown) {
  return reply.code(400).send({
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

function notFoundError(reply: FastifyReply, code: string, message: string) {
  return reply.code(404).send({
    error: {
      code,
      message,
      details: {},
    },
  });
}

function conflictError(reply: FastifyReply, code: string, message: string) {
  return reply.code(409).send({
    error: {
      code,
      message,
      details: {},
    },
  });
}

async function requireActor(request: FastifyRequest, deps: AppDeps, reply: FastifyReply) {
  try {
    const actorUserId = await requireActorUserId(deps.prisma, request);
    return { actorUserId, actorDisplay: getActorDisplay(request) };
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      reply.code(401).send({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required.',
          details: {},
        },
      });
      return null;
    }
    throw error;
  }
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
      },
      orderBy: [{ resourceType: 'asc' }, { name: 'asc' }],
    });

    return reply.code(200).send({ resources });
  });

  app.post('/api/resources', async (request, reply) => {
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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
          inventoryQuantity: resourceType === ResourceType.PERSON ? 1 : 1,
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
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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

    if (existing.resourceType === ResourceType.PERSON && body.data.inventoryQuantity !== undefined) {
      return reply.code(400).send({
        error: {
          code: 'PERSON_INVENTORY_IMMUTABLE',
          message: 'PERSON resource inventoryQuantity cannot be changed.',
          details: {},
        },
      });
    }

    const updateData: { name?: string; active?: boolean } = {};
    if (body.data.name !== undefined) {
      updateData.name = body.data.name;
    }
    if (body.data.active !== undefined) {
      updateData.active = body.data.active;
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
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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

  app.get('/api/foremen', async (_request, reply) => {
    const foremen = await deps.prisma.resource.findMany({
      where: {
        deletedAt: null,
        resourceType: ResourceType.PERSON,
        isForeman: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return reply.code(200).send({ foremen });
  });

  app.get('/api/foremen/:foremanId/rosters/:date', async (request, reply) => {
    const params = rosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster lookup request.', params.error.flatten());
    }

    const date = parseDateOnlyUtc(params.data.date);
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

  app.get('/api/foremen/:foremanId/rosters/:date/members', async (request, reply) => {
    const params = rosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster members lookup request.', params.error.flatten());
    }

    const date = parseDateOnlyUtc(params.data.date);
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
      },
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
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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
      return reply.code(200).send({ roster: existingRoster });
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

  app.post('/api/foremen/:foremanId/rosters/:date/members', async (request, reply) => {
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
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

    const serviceDate = parseDateOnlyUtc(params.data.date);
    if (!serviceDate) {
      return validationError(reply, 'Invalid roster date.', {});
    }

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: params.data.foremanId,
        date: serviceDate,
        deletedAt: null,
      },
      select: {
        id: true,
        date: true,
        foremanPersonId: true,
      },
    });
    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found for foreman and date.');
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
              date: params.data.date,
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

  app.delete('/api/foremen/:foremanId/rosters/:date/members/:personResourceId', async (request, reply) => {
    const actor = await requireActor(request, deps, reply);
    if (!actor) {
      return;
    }

    const params = deleteRosterMemberParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationError(reply, 'Invalid roster member delete request.', params.error.flatten());
    }

    const serviceDate = parseDateOnlyUtc(params.data.date);
    if (!serviceDate) {
      return validationError(reply, 'Invalid roster date.', {});
    }

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: params.data.foremanId,
        date: serviceDate,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!roster) {
      return notFoundError(reply, 'ROSTER_NOT_FOUND', 'Roster not found for foreman and date.');
    }

    const member = await deps.prisma.foremanDayRosterMember.findFirst({
      where: {
        rosterId: roster.id,
        personResourceId: params.data.personResourceId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!member) {
      return notFoundError(reply, 'ROSTER_MEMBER_NOT_FOUND', 'Roster member not found.');
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.foremanDayRosterMember.delete({
        where: { id: member.id },
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
            date: params.data.date,
            personResourceId: params.data.personResourceId,
          },
        },
      });
    });

    return reply.code(204).send();
  });
}
