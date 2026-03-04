import { describe, expect, test } from 'vitest';
import { parseNotes } from '@sylvara/shared';

describe('parseNotes', () => {
  test('parses PUSH UP IF POSSIBLE and detects DTL + CBP requirements', () => {
    const parsed = parseNotes('PUSH UP IF POSSIBLE DTL CBP');

    expect(parsed.pushUpIfPossible).toBe(true);
    expect(parsed.requirements.map((requirement) => requirement.typeCode)).toEqual([
      'POLICE_DETAIL',
      'CRANE_AND_BOOM_PERMIT',
    ]);
  });

  test('parses DW ditch witch suggestion', () => {
    const parsed = parseNotes('DW - NEED DITCH WITCH');

    expect(parsed.ditchWitchSuggested).toBe(true);
  });

  test('parses RS MM/DD as RESCHEDULE_TO', () => {
    const parsed = parseNotes('RS 4/15');

    expect(parsed.scheduleEvents).toHaveLength(1);
    expect(parsed.scheduleEvents[0]?.eventType).toBe('RESCHEDULE_TO');
    expect(parsed.scheduleEvents[0]?.toAt?.getUTCMonth()).toBe(3);
    expect(parsed.scheduleEvents[0]?.toAt?.getUTCDate()).toBe(15);
  });

  test('parses TBRS MM/DD as TBS_FROM', () => {
    const parsed = parseNotes('TBRS 3/1');

    expect(parsed.scheduleEvents).toHaveLength(1);
    expect(parsed.scheduleEvents[0]?.eventType).toBe('TBS_FROM');
    expect(parsed.scheduleEvents[0]?.fromAt?.getUTCMonth()).toBe(2);
    expect(parsed.scheduleEvents[0]?.fromAt?.getUTCDate()).toBe(1);
  });

  test('parses RS TO ... FROM ... as DATE_SWAP', () => {
    const parsed = parseNotes('RS TO 5/10 FROM 4/20');

    expect(parsed.scheduleEvents).toHaveLength(1);
    expect(parsed.scheduleEvents[0]?.eventType).toBe('DATE_SWAP');
    expect(parsed.scheduleEvents[0]?.toAt?.getUTCMonth()).toBe(4);
    expect(parsed.scheduleEvents[0]?.toAt?.getUTCDate()).toBe(10);
    expect(parsed.scheduleEvents[0]?.fromAt?.getUTCMonth()).toBe(3);
    expect(parsed.scheduleEvents[0]?.fromAt?.getUTCDate()).toBe(20);
  });

  test('parses NO EMAIL + PU', () => {
    const parsed = parseNotes('NO EMAIL PU');

    expect(parsed.noEmail).toBe(true);
    expect(parsed.pushUpIfPossible).toBe(true);
    expect(parsed.confidence.pushUpIfPossible).toBe(70);
  });

  test('parses TREE PERMIT NEEDED requirement', () => {
    const parsed = parseNotes('TREE PERMIT NEEDED');

    expect(parsed.requirements).toHaveLength(1);
    expect(parsed.requirements[0]?.typeCode).toBe('TREE_PERMIT');
  });

  test('parses MUST BE 1ST JOB flag', () => {
    const parsed = parseNotes('MUST BE 1ST JOB');

    expect(parsed.mustBeFirstJob).toBe(true);
    expect(parsed.confidence.mustBeFirstJob).toBe(90);
  });

  test('returns all false/empty for no recognized tokens', () => {
    const parsed = parseNotes('this note has no known parser tokens');

    expect(parsed.pushUpIfPossible).toBe(false);
    expect(parsed.mustBeFirstJob).toBe(false);
    expect(parsed.noEmail).toBe(false);
    expect(parsed.ditchWitchSuggested).toBe(false);
    expect(parsed.requirements).toEqual([]);
    expect(parsed.scheduleEvents).toEqual([]);
    expect(parsed.unparsedSignals).toEqual([]);
  });

  test('captures unrecognized significant token in unparsedSignals', () => {
    const parsed = parseNotes('GIBBERISH TOKEN 123');

    expect(parsed.unparsedSignals).toContain('GIBBERISH');
  });

  test('parses mixed-case input case-insensitively', () => {
    const parsed = parseNotes('push up if possible dtl cbp');

    expect(parsed.pushUpIfPossible).toBe(true);
    expect(parsed.requirements.map((requirement) => requirement.typeCode)).toEqual([
      'POLICE_DETAIL',
      'CRANE_AND_BOOM_PERMIT',
    ]);
  });

  test('handles empty string without throwing', () => {
    const parsed = parseNotes('');

    expect(parsed.pushUpIfPossible).toBe(false);
    expect(parsed.mustBeFirstJob).toBe(false);
    expect(parsed.noEmail).toBe(false);
    expect(parsed.ditchWitchSuggested).toBe(false);
    expect(parsed.requirements).toEqual([]);
    expect(parsed.scheduleEvents).toEqual([]);
    expect(parsed.unparsedSignals).toEqual([]);
  });
});
