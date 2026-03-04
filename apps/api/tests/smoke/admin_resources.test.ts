import { describe, expect, test } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const PERSON_ID = '22222222-2222-4222-8222-222222222222';
const EQUIPMENT_ID = '33333333-3333-4333-8333-333333333333';
const HOME_BASE_ID = '44444444-4444-4444-8444-444444444444';
const FOREMAN_ID = '55555555-5555-4555-8555-555555555555';
const ROSTER_ID = '66666666-6666-4666-8666-666666666666';
const MEMBER_ID = '77777777-7777-4777-8777-777777777777';
const CREW_MEMBER_ID = '88888888-8888-4888-8888-888888888888';

function actorPrisma() {
  return {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
    },
  };
}

describe('admin resources and rosters', () => {
  test('POST /api/resources creates PERSON with inventoryQuantity=1', async () => {
    const captured: { createData?: Record<string, unknown> } = {};
    const app = buildServer({
      prisma: {
        ...actorPrisma(),
        $transaction: async (
          fn: (tx: {
            resource: {
              create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
            };
            activityLog: {
              create: (args: { data: Record<string, unknown> }) => Promise<void>;
            };
          }) => Promise<unknown>,
        ) =>
          fn({
            resource: {
              create: async ({ data }) => {
                captured.createData = data;
                return {
                  id: PERSON_ID,
                  ...data,
                  createdAt: new Date('2026-03-04T00:00:00.000Z'),
                  updatedAt: new Date('2026-03-04T00:00:00.000Z'),
                  deletedAt: null,
                };
              },
            },
            activityLog: {
              create: async () => undefined,
            },
          }),
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/resources',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        name: 'Foreman One',
        resourceType: 'PERSON',
        isForeman: true,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().resource.inventoryQuantity).toBe(1);
    expect(response.json().resource.isForeman).toBe(true);
    expect(captured.createData?.inventoryQuantity).toBe(1);
    await app.close();
  });

  test('POST /api/resources creates EQUIPMENT and forces isForeman=false', async () => {
    const captured: { createData?: Record<string, unknown> } = {};
    const app = buildServer({
      prisma: {
        ...actorPrisma(),
        $transaction: async (
          fn: (tx: {
            resource: {
              create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
            };
            activityLog: {
              create: (args: { data: Record<string, unknown> }) => Promise<void>;
            };
          }) => Promise<unknown>,
        ) =>
          fn({
            resource: {
              create: async ({ data }) => {
                captured.createData = data;
                return {
                  id: EQUIPMENT_ID,
                  ...data,
                  createdAt: new Date('2026-03-04T00:00:00.000Z'),
                  updatedAt: new Date('2026-03-04T00:00:00.000Z'),
                  deletedAt: null,
                };
              },
            },
            activityLog: {
              create: async () => undefined,
            },
          }),
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/resources',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        name: 'Crane 1090',
        resourceType: 'EQUIPMENT',
        isForeman: true,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().resource.isForeman).toBe(false);
    expect(captured.createData?.isForeman).toBe(false);
    await app.close();
  });

  test('POST /api/home-bases creates home base with minute-of-day fields', async () => {
    const captured: { createData?: Record<string, unknown> } = {};
    const app = buildServer({
      prisma: {
        ...actorPrisma(),
        $transaction: async (
          fn: (tx: {
            homeBase: {
              create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
            };
            activityLog: {
              create: (args: { data: Record<string, unknown> }) => Promise<void>;
            };
          }) => Promise<unknown>,
        ) =>
          fn({
            homeBase: {
              create: async ({ data }) => {
                captured.createData = data;
                return {
                  id: HOME_BASE_ID,
                  ...data,
                  active: true,
                  createdAt: new Date('2026-03-04T00:00:00.000Z'),
                  updatedAt: new Date('2026-03-04T00:00:00.000Z'),
                  deletedAt: null,
                };
              },
            },
            activityLog: {
              create: async () => undefined,
            },
          }),
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/home-bases',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        name: 'Natick',
        addressLine1: '1 Main St',
        city: 'Natick',
        state: 'MA',
        postalCode: '01760',
        openingTime: 360,
        closingTime: 1080,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().homeBase.openingMinute).toBe(360);
    expect(response.json().homeBase.closingMinute).toBe(1080);
    expect(captured.createData?.openingMinute).toBe(360);
    await app.close();
  });

  test('POST /api/foremen/:id/rosters creates roster', async () => {
    const app = buildServer({
      prisma: {
        ...actorPrisma(),
        resource: {
          findFirst: async () => ({ id: FOREMAN_ID }),
        },
        homeBase: {
          findFirst: async () => ({ id: HOME_BASE_ID }),
        },
        foremanDayRoster: {
          findFirst: async () => null,
        },
        $transaction: async (
          fn: (tx: {
            foremanDayRoster: {
              create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
            };
            activityLog: {
              create: (args: { data: Record<string, unknown> }) => Promise<void>;
            };
          }) => Promise<unknown>,
        ) =>
          fn({
            foremanDayRoster: {
              create: async ({ data }) => ({
                id: ROSTER_ID,
                ...data,
                createdAt: new Date('2026-03-04T00:00:00.000Z'),
                updatedAt: new Date('2026-03-04T00:00:00.000Z'),
                deletedAt: null,
              }),
            },
            activityLog: {
              create: async () => undefined,
            },
          }),
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        date: '2026-03-04',
        homeBaseId: HOME_BASE_ID,
        preferredStartMinute: 420,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().roster.id).toBe(ROSTER_ID);
    await app.close();
  });

  test('POST roster members returns 201 then 409 on day-exclusivity conflict', async () => {
    let memberCreateCount = 0;
    const app = buildServer({
      prisma: {
        ...actorPrisma(),
        foremanDayRoster: {
          findFirst: async () => ({
            id: ROSTER_ID,
            date: new Date('2026-03-04T00:00:00.000Z'),
            foremanPersonId: FOREMAN_ID,
          }),
        },
        resource: {
          findFirst: async () => ({ id: CREW_MEMBER_ID }),
        },
        $transaction: async (
          fn: (tx: {
            foremanDayRosterMember: {
              create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
            };
            activityLog: {
              create: (args: { data: Record<string, unknown> }) => Promise<void>;
            };
          }) => Promise<unknown>,
        ) =>
          fn({
            foremanDayRosterMember: {
              create: async ({ data }) => {
                memberCreateCount += 1;
                if (memberCreateCount > 1) {
                  throw { code: 'P2002' };
                }
                return {
                  id: MEMBER_ID,
                  ...data,
                  createdAt: new Date('2026-03-04T00:00:00.000Z'),
                  deletedAt: null,
                };
              },
            },
            activityLog: {
              create: async () => undefined,
            },
          }),
      } as unknown as PrismaClient,
    });

    const first = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/2026-03-04/members`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        personResourceId: CREW_MEMBER_ID,
        role: 'GROUND',
      },
    });
    expect(first.statusCode).toBe(201);
    expect(first.json().member.id).toBe(MEMBER_ID);

    const second = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/2026-03-04/members`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        personResourceId: CREW_MEMBER_ID,
        role: 'GROUND',
      },
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().error.code).toBe('ROSTER_MEMBER_ALREADY_ASSIGNED');
    await app.close();
  });
});
