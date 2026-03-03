import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { PreferredChannel } from '@prisma/client';
import { buildServer } from '../../src/server';
import { makePrisma, resetDb, seedBase } from './_helpers/db';

const prisma = makePrisma();

describe('preferred channels integration (real postgres)', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('happy path sets channels with replace semantics and writes activity log actor', async () => {
    const { actor, job } = await seedBase(prisma);
    await prisma.jobPreferredChannel.createMany({
      data: [
        { jobId: job.id, channel: PreferredChannel.EMAIL },
        { jobId: job.id, channel: PreferredChannel.CALL },
      ],
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${job.id}/preferred-channels`,
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        channels: ['CALL', 'TEXT'],
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.ok).toBe(true);
    expect(body.channels).toHaveLength(2);
    expect([...body.channels].sort()).toEqual(['CALL', 'TEXT']);

    const saved = await prisma.jobPreferredChannel.findMany({
      where: { jobId: job.id },
      select: { channel: true },
    });
    expect(saved).toHaveLength(2);
    expect(saved.map((row) => row.channel).sort()).toEqual([
      PreferredChannel.CALL,
      PreferredChannel.TEXT,
    ]);

    const log = await prisma.activityLog.findFirst({
      where: {
        entityType: 'Job',
        entityId: job.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(log).not.toBeNull();
    expect(log?.actorUserId).toBe(actor.id);
    await app.close();
  });

  test('rejects invalid channel payload and leaves DB unchanged', async () => {
    const { actor, job } = await seedBase(prisma);
    await prisma.jobPreferredChannel.create({
      data: {
        jobId: job.id,
        channel: PreferredChannel.CALL,
      },
    });

    const before = await prisma.jobPreferredChannel.findMany({
      where: { jobId: job.id },
      select: { channel: true },
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${job.id}/preferred-channels`,
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        channels: ['FAX'],
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error?.code).toBe('VALIDATION_ERROR');

    const after = await prisma.jobPreferredChannel.findMany({
      where: { jobId: job.id },
      select: { channel: true },
    });
    expect(after.map((row) => row.channel).sort()).toEqual(
      before.map((row) => row.channel).sort(),
    );
    await app.close();
  });
});
