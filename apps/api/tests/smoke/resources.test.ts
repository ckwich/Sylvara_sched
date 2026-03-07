import { ResourceType, UserRole, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const VIEWER_ID = '33333333-3333-4333-8333-333333333333';

type ResourceRow = {
  id: string;
  name: string;
  resourceType: ResourceType;
  inventoryQuantity: number;
  isForeman: boolean;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function createMockPrisma() {
  let nextId = 1000;
  const resources: ResourceRow[] = [
    {
      id: 'aaaa1111-1111-4111-8111-111111111111',
      name: 'Lift A',
      resourceType: ResourceType.EQUIPMENT,
      inventoryQuantity: 2,
      isForeman: false,
      active: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const users = new Map([
    [MANAGER_ID, { id: MANAGER_ID, role: UserRole.MANAGER, active: true }],
    [VIEWER_ID, { id: VIEWER_ID, role: UserRole.VIEWER, active: true }],
  ]);

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => users.get(where.id) ?? null,
    },
    resource: {
      findMany: async ({
        where,
      }: {
        where: { deletedAt: null; resourceType?: ResourceType; active?: boolean };
      }) =>
        resources.filter((resource) => {
          if (resource.deletedAt !== null) {
            return false;
          }
          if (where.resourceType && resource.resourceType !== where.resourceType) {
            return false;
          }
          if (where.active !== undefined && resource.active !== where.active) {
            return false;
          }
          return true;
        }),
      findFirst: async ({
        where,
      }: {
        where: { id?: string; deletedAt?: null; resourceType?: ResourceType; isForeman?: boolean };
      }) =>
        resources.find((resource) => {
          if (where.id && resource.id !== where.id) {
            return false;
          }
          if (where.deletedAt === null && resource.deletedAt !== null) {
            return false;
          }
          if (where.resourceType && resource.resourceType !== where.resourceType) {
            return false;
          }
          if (where.isForeman !== undefined && resource.isForeman !== where.isForeman) {
            return false;
          }
          return true;
        }) ?? null,
      create: async ({
        data,
      }: {
        data: {
          name: string;
          resourceType: ResourceType;
          inventoryQuantity: number;
          isForeman: boolean;
          active: boolean;
        };
      }) => {
        const created: ResourceRow = {
          id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
          name: data.name,
          resourceType: data.resourceType,
          inventoryQuantity: data.inventoryQuantity,
          isForeman: data.isForeman,
          active: data.active,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        resources.push(created);
        return created;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Pick<ResourceRow, 'name' | 'active' | 'inventoryQuantity' | 'deletedAt'>>;
      }) => {
        const resource = resources.find((item) => item.id === where.id);
        if (!resource) {
          throw new Error('Not found');
        }
        if (data.name !== undefined) {
          resource.name = data.name;
        }
        if (data.active !== undefined) {
          resource.active = data.active;
        }
        if (data.inventoryQuantity !== undefined) {
          resource.inventoryQuantity = data.inventoryQuantity;
        }
        if (data.deletedAt !== undefined) {
          resource.deletedAt = data.deletedAt;
        }
        resource.updatedAt = new Date();
        return resource;
      },
    },
    activityLog: {
      create: async () => undefined,
    },
    $transaction: async <T>(input: T | ((tx: unknown) => Promise<T>)) => {
      if (typeof input === 'function') {
        return input({
          resource: prisma.resource,
          activityLog: prisma.activityLog,
        });
      }
      return input;
    },
  };

  return { prisma: prisma as unknown as PrismaClient, resources };
}

describe('resources endpoints', () => {
  test('GET /api/resources returns list', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'GET',
      url: '/api/resources',
      headers: lanAuthHeaders('GET', MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().resources).toHaveLength(1);
    await app.close();
  });

  test('POST /api/resources as MANAGER creates resource', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/resources',
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: {
        name: 'New Bucket',
        resourceType: 'EQUIPMENT',
        inventoryQuantity: 5,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().resource.inventoryQuantity).toBe(5);
    await app.close();
  });

  test('POST /api/resources as VIEWER returns 403', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/resources',
      headers: lanAuthHeaders('POST', VIEWER_ID),
      payload: {
        name: 'Blocked',
        resourceType: 'EQUIPMENT',
      },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  test('PATCH /api/resources/:id with PERSON ignores inventoryQuantity and keeps 1', async () => {
    const mock = createMockPrisma();
    mock.resources.push({
      id: 'bbbb2222-2222-4222-8222-222222222222',
      name: 'Person A',
      resourceType: ResourceType.PERSON,
      inventoryQuantity: 1,
      isForeman: false,
      active: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/resources/bbbb2222-2222-4222-8222-222222222222',
      headers: lanAuthHeaders('PATCH', MANAGER_ID),
      payload: {
        inventoryQuantity: 99,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().resource.inventoryQuantity).toBe(1);
    await app.close();
  });

  test('DELETE /api/resources/:id soft deletes', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/resources/aaaa1111-1111-4111-8111-111111111111',
      headers: lanAuthHeaders('DELETE', MANAGER_ID),
    });

    expect(response.statusCode).toBe(204);
    expect(mock.resources[0].deletedAt).not.toBeNull();
    await app.close();
  });
});
