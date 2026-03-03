import { describe, expect, test } from 'vitest';
import { Prisma } from '@prisma/client';
import { computeScheduledEffectiveHours, deriveJobState } from '../../src/scheduling/job-state';

describe('job state derivation', () => {
  test('returns TBS when no active scheduled hours', () => {
    const state = deriveJobState({
      completedDate: null,
      estimateHoursCurrent: new Prisma.Decimal('8'),
      scheduledEffectiveHours: new Prisma.Decimal('0'),
    });

    expect(state).toBe('TBS');
  });

  test('returns PARTIALLY_SCHEDULED when scheduled below estimate tolerance', () => {
    const state = deriveJobState({
      completedDate: null,
      estimateHoursCurrent: new Prisma.Decimal('8'),
      scheduledEffectiveHours: new Prisma.Decimal('7.98'),
    });

    expect(state).toBe('PARTIALLY_SCHEDULED');
  });

  test('returns FULLY_SCHEDULED when scheduled meets estimate', () => {
    const state = deriveJobState({
      completedDate: null,
      estimateHoursCurrent: new Prisma.Decimal('8'),
      scheduledEffectiveHours: new Prisma.Decimal('8'),
    });

    expect(state).toBe('FULLY_SCHEDULED');
  });

  test('returns COMPLETED whenever completed date exists', () => {
    const state = deriveJobState({
      completedDate: new Date('2026-03-03T00:00:00.000Z'),
      estimateHoursCurrent: new Prisma.Decimal('8'),
      scheduledEffectiveHours: new Prisma.Decimal('0'),
    });

    expect(state).toBe('COMPLETED');
  });

  test('computes scheduled hours from override or timezone-aware wall clock', () => {
    const hours = computeScheduledEffectiveHours({
      timezone: 'America/New_York',
      segments: [
        {
          startDatetime: new Date('2026-03-03T14:00:00.000Z'),
          endDatetime: new Date('2026-03-03T16:00:00.000Z'),
          scheduledHoursOverride: null,
        },
        {
          startDatetime: new Date('2026-03-03T16:00:00.000Z'),
          endDatetime: new Date('2026-03-03T17:00:00.000Z'),
          scheduledHoursOverride: new Prisma.Decimal('3.5'),
        },
      ],
    });

    expect(hours.toString()).toBe('5.5');
  });
});

