import { describe, expect, test } from 'vitest';
import { isIntervalInsideWindow, parseCustomerAvailabilityWindow } from '../../src/scheduling/customer-window';

const ATTEMPT = { startMinute: 10 * 60 + 30, endMinute: 12 * 60 + 30 };

describe('A6 customer window parsing and enforcement', () => {
  test('09:00-11:00 rejects 10:30-12:30', () => {
    const window = parseCustomerAvailabilityWindow('09:00-11:00');
    expect(window).not.toBeNull();
    expect(isIntervalInsideWindow(ATTEMPT, window!)).toBe(false);
  });

  test('9am-11am rejects 10:30-12:30', () => {
    const window = parseCustomerAvailabilityWindow('9am-11am');
    expect(window).not.toBeNull();
    expect(isIntervalInsideWindow(ATTEMPT, window!)).toBe(false);
  });

  test('9-11am rejects 10:30-12:30', () => {
    const window = parseCustomerAvailabilityWindow('9-11am');
    expect(window).not.toBeNull();
    expect(isIntervalInsideWindow(ATTEMPT, window!)).toBe(false);
  });

  test('9 to 11am rejects 10:30-12:30 via "to" normalization', () => {
    const window = parseCustomerAvailabilityWindow('9 to 11am');
    expect(window).not.toBeNull();
    expect(isIntervalInsideWindow(ATTEMPT, window!)).toBe(false);
  });

  test('mornings only does not configure a rejecting window', () => {
    const window = parseCustomerAvailabilityWindow('mornings only');
    expect(window).toBeNull();
  });
});
