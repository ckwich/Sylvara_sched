import { describe, expect, it } from 'vitest';
import { browserTimezoneDiffers, companyLocalInputToUtcIso } from './company-time';

describe('companyLocalInputToUtcIso', () => {
  it('converts a New York local datetime to UTC', () => {
    expect(companyLocalInputToUtcIso('2026-03-03T09:10', 'America/New_York')).toBe(
      '2026-03-03T14:10:00.000Z',
    );
  });

  it('throws for invalid datetime-local input', () => {
    expect(() => companyLocalInputToUtcIso('03/03/2026 09:10', 'America/New_York')).toThrow(
      /VALIDATION_ERROR/,
    );
  });
});

describe('browserTimezoneDiffers', () => {
  it('returns a boolean', () => {
    expect(typeof browserTimezoneDiffers('America/New_York')).toBe('boolean');
  });
});
