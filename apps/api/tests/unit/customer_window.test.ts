import { describe, expect, test } from 'vitest';
import { parseCustomerAvailabilityWindow } from '../../src/scheduling/customer-window';

describe('customer window parser', () => {
  test('parses first valid window even when unparseable text appears earlier', () => {
    const parsed = parseCustomerAvailabilityWindow('mornings only, 7am-5pm');
    expect(parsed).toEqual({
      startMinute: 420,
      endMinute: 1020,
    });
  });
});
