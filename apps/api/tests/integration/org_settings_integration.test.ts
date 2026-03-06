import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { makePrisma, resetDb, seedBase } from './_helpers/db';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const prisma = makePrisma();
const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';

describe('org settings integration (real postgres)', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('PATCH timezone persists and GET returns updated value', async () => {
    const { actor } = await seedBase(prisma);
    await prisma.user.update({
      where: { id: actor.id },
      data: { role: 'MANAGER' },
    });
    const app = buildServer({ prisma });

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: lanAuthHeaders('PATCH', String(actor.id)),
      payload: {
        companyTimezone: 'America/Chicago',
      },
    });
    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.json().companyTimezone).toBe('America/Chicago');

    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/org-settings',
      headers: lanAuthHeaders('GET', String(actor.id)),
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().companyTimezone).toBe('America/Chicago');

    const log = await prisma.activityLog.findFirst({
      where: {
        entityType: 'OrgSettings',
        entityId: ORG_SETTINGS_ID,
        actionType: 'UPDATED',
        actorUserId: actor.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(log).not.toBeNull();

    await app.close();
  });
});
