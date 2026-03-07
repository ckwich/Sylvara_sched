import { ResourceType, RosterMemberRole, UserRole, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const FOREMAN_ID = '22222222-2222-4222-8222-222222222222';
const MEMBER_ID = '33333333-3333-4333-8333-333333333333';
const HOME_BASE_ID = '44444444-4444-4444-8444-444444444444';

type RosterRow = {
  id: string;
  foremanPersonId: string;
  date: Date;
  homeBaseId: string;
  deletedAt: Date | null;
};

type MemberRow = {
  id: string;
  rosterId: string;
  date: Date;
  personResourceId: string;
  role: RosterMemberRole;
  deletedAt: Date | null;
};

function createMockPrisma() {
  const users = new Map([[MANAGER_ID, { id: MANAGER_ID, role: UserRole.MANAGER, active: true }]]);
  const rosters: RosterRow[] = [];
  const members: MemberRow[] = [];
  let rosterSeq = 1;
  let memberSeq = 1;
  const nextUuid = (seq: number) => `00000000-0000-4000-8000-${String(seq).padStart(12, '0')}`;

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => users.get(where.id) ?? null,
    },
    resource: {
      findFirst: async ({
        where,
      }: {
        where: { id: string; deletedAt: null; resourceType: ResourceType; isForeman?: boolean };
      }) => {
        if (where.id === FOREMAN_ID && where.resourceType === ResourceType.PERSON && where.isForeman) {
          return { id: FOREMAN_ID };
        }
        if (where.id === MEMBER_ID && where.resourceType === ResourceType.PERSON) {
          return { id: MEMBER_ID };
        }
        return null;
      },
    },
    homeBase: {
      findFirst: async ({ where }: { where: { id: string; deletedAt: null } }) =>
        where.id === HOME_BASE_ID ? { id: HOME_BASE_ID } : null,
    },
    foremanDayRoster: {
      findFirst: async ({
        where,
      }: {
        where: { id?: string; foremanPersonId?: string; date?: Date; deletedAt?: null };
      }) =>
        rosters.find((roster) => {
          if (where.id && roster.id !== where.id) {
            return false;
          }
          if (where.foremanPersonId && roster.foremanPersonId !== where.foremanPersonId) {
            return false;
          }
          if (where.date && roster.date.toISOString().slice(0, 10) !== where.date.toISOString().slice(0, 10)) {
            return false;
          }
          if (where.deletedAt === null && roster.deletedAt !== null) {
            return false;
          }
          return true;
        }) ?? null,
      create: async ({
        data,
      }: {
        data: {
          foremanPersonId: string;
          date: Date;
          homeBaseId: string;
          notes?: string;
          preferredStartMinute?: number;
          preferredEndMinute?: number;
          createdByUserId: string;
        };
      }) => {
        const created: RosterRow = {
          id: nextUuid(rosterSeq++),
          foremanPersonId: data.foremanPersonId,
          date: data.date,
          homeBaseId: data.homeBaseId,
          deletedAt: null,
        };
        rosters.push(created);
        return created;
      },
      update: async ({ where, data }: { where: { id: string }; data: { deletedAt: Date } }) => {
        const roster = rosters.find((item) => item.id === where.id);
        if (!roster) {
          throw new Error('Roster missing');
        }
        roster.deletedAt = data.deletedAt;
        return roster;
      },
    },
    foremanDayRosterMember: {
      findFirst: async ({
        where,
      }: {
        where: { id?: string; rosterId?: string; deletedAt?: null };
      }) =>
        members.find((member) => {
          if (where.id && member.id !== where.id) {
            return false;
          }
          if (where.rosterId && member.rosterId !== where.rosterId) {
            return false;
          }
          if (where.deletedAt === null && member.deletedAt !== null) {
            return false;
          }
          return true;
        }) ?? null,
      create: async ({
        data,
      }: {
        data: {
          rosterId: string;
          date: Date;
          personResourceId: string;
          role: RosterMemberRole;
        };
      }) => {
        const duplicate = members.find(
          (member) =>
            member.date.toISOString().slice(0, 10) === data.date.toISOString().slice(0, 10) &&
            member.personResourceId === data.personResourceId &&
            member.deletedAt === null,
        );
        if (duplicate) {
          const error = new Error('duplicate') as Error & { code: string };
          error.code = 'P2002';
          throw error;
        }
        const created: MemberRow = {
          id: nextUuid(5000 + memberSeq++),
          rosterId: data.rosterId,
          date: data.date,
          personResourceId: data.personResourceId,
          role: data.role,
          deletedAt: null,
        };
        members.push(created);
        return created;
      },
      update: async ({ where, data }: { where: { id: string }; data: { deletedAt: Date } }) => {
        const member = members.find((item) => item.id === where.id);
        if (!member) {
          throw new Error('Member missing');
        }
        member.deletedAt = data.deletedAt;
        return member;
      },
      updateMany: async ({ where, data }: { where: { rosterId: string; deletedAt: null }; data: { deletedAt: Date } }) => {
        let count = 0;
        for (const member of members) {
          if (member.rosterId === where.rosterId && member.deletedAt === null) {
            member.deletedAt = data.deletedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
    segmentRosterLink: {
      updateMany: async () => ({ count: 0 }),
    },
    activityLog: {
      create: async () => undefined,
    },
    $transaction: async <T>(input: T | ((tx: unknown) => Promise<T>)) => {
      if (typeof input === 'function') {
        return input({
          foremanDayRoster: prisma.foremanDayRoster,
          foremanDayRosterMember: prisma.foremanDayRosterMember,
          segmentRosterLink: prisma.segmentRosterLink,
          activityLog: prisma.activityLog,
        });
      }
      return input;
    },
  };

  return { prisma: prisma as unknown as PrismaClient, rosters, members };
}

describe('roster management endpoints', () => {
  test('POST /api/foremen/:id/rosters creates roster', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });

    expect(response.statusCode).toBe(201);
    expect(mock.rosters).toHaveLength(1);
    await app.close();
  });

  test('POST same date twice returns 409', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });
    const response = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });

    expect(response.statusCode).toBe(409);
    await app.close();
  });

  test('POST /api/foremen/:id/rosters/:id/members adds member', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const create = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });
    const rosterId = create.json().roster.id as string;

    const response = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/${rosterId}/members`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { personResourceId: MEMBER_ID, role: 'CLIMBER' },
    });

    expect(response.statusCode).toBe(201);
    expect(mock.members).toHaveLength(1);
    await app.close();
  });

  test('POST same member twice returns 409', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const create = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });
    const rosterId = create.json().roster.id as string;

    await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/${rosterId}/members`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { personResourceId: MEMBER_ID, role: 'CLIMBER' },
    });
    const response = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/${rosterId}/members`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { personResourceId: MEMBER_ID, role: 'CLIMBER' },
    });

    expect(response.statusCode).toBe(409);
    await app.close();
  });

  test('DELETE member soft deletes', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const create = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-07', homeBaseId: HOME_BASE_ID },
    });
    const rosterId = create.json().roster.id as string;
    const add = await app.inject({
      method: 'POST',
      url: `/api/foremen/${FOREMAN_ID}/rosters/${rosterId}/members`,
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { personResourceId: MEMBER_ID, role: 'CLIMBER' },
    });
    const memberId = add.json().member.id as string;

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/foremen/${FOREMAN_ID}/rosters/${rosterId}/members/${memberId}`,
      headers: lanAuthHeaders('DELETE', MANAGER_ID),
    });

    expect(response.statusCode).toBe(204);
    expect(mock.members[0].deletedAt).not.toBeNull();
    await app.close();
  });
});
