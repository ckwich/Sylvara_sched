export interface ParsedNotes {
  pushUpIfPossible: boolean;
  mustBeFirstJob: boolean;
  noEmail: boolean;
  requirements: DetectedRequirement[];
  ditchWitchSuggested: boolean;
  scheduleEvents: DetectedScheduleEvent[];
  unparsedSignals: string[];
  confidence: ParsedNotesConfidence;
}

export interface DetectedRequirement {
  typeCode: 'POLICE_DETAIL' | 'CRANE_AND_BOOM_PERMIT' | 'TREE_PERMIT';
  rawSnippet: string;
  source: 'LEGACY_PARSE';
}

export interface DetectedScheduleEvent {
  eventType: 'RESCHEDULE_TO' | 'TBS_FROM' | 'DATE_SWAP';
  fromAt: Date | null;
  toAt: Date | null;
  rawSnippet: string;
  source: 'LEGACY_PARSE';
}

export interface ParsedNotesConfidence {
  pushUpIfPossible: number;
  mustBeFirstJob: number;
  noEmail: number;
  ditchWitchSuggested: number;
  [key: string]: number;
}

const YEAR_TWO_DIGIT_BASE = 2000;

function parseLegacyDate(rawDate: string): Date | null {
  const match = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/.exec(rawDate.trim());
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const yearRaw = match[3];
  const year =
    yearRaw === undefined
      ? new Date().getUTCFullYear()
      : yearRaw.length === 2
        ? YEAR_TWO_DIGIT_BASE + Number(yearRaw)
        : Number(yearRaw);

  const parsed = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function maxConfidence(current: number, next: number): number {
  return next > current ? next : current;
}

export function parseNotes(raw: string): ParsedNotes {
  const text = typeof raw === 'string' ? raw : '';
  const requirements: DetectedRequirement[] = [];
  const scheduleEvents: DetectedScheduleEvent[] = [];
  const unparsedSignals: string[] = [];

  const confidence: ParsedNotesConfidence = {
    pushUpIfPossible: 0,
    mustBeFirstJob: 0,
    noEmail: 0,
    ditchWitchSuggested: 0,
  };

  let pushUpIfPossible = false;
  let mustBeFirstJob = false;
  let noEmail = false;
  let ditchWitchSuggested = false;

  const matchedSnippets = new Set<string>();

  const dateSwapRegex = /\bRS\s+TO\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+FROM\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi;
  let dateSwapMatch = dateSwapRegex.exec(text);
  while (dateSwapMatch) {
    const toAt = parseLegacyDate(dateSwapMatch[1]);
    const fromAt = parseLegacyDate(dateSwapMatch[2]);
    if (toAt && fromAt) {
      scheduleEvents.push({
        eventType: 'DATE_SWAP',
        fromAt,
        toAt,
        rawSnippet: dateSwapMatch[0],
        source: 'LEGACY_PARSE',
      });
      matchedSnippets.add(dateSwapMatch[0]);
    } else {
      unparsedSignals.push(dateSwapMatch[0]);
    }
    dateSwapMatch = dateSwapRegex.exec(text);
  }

  const rsRegex = /\bRS\b(?!\s+TO\b)\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi;
  let rsMatch = rsRegex.exec(text);
  while (rsMatch) {
    const toAt = parseLegacyDate(rsMatch[1]);
    if (toAt) {
      scheduleEvents.push({
        eventType: 'RESCHEDULE_TO',
        fromAt: null,
        toAt,
        rawSnippet: rsMatch[0],
        source: 'LEGACY_PARSE',
      });
      matchedSnippets.add(rsMatch[0]);
    } else {
      unparsedSignals.push(rsMatch[0]);
    }
    rsMatch = rsRegex.exec(text);
  }

  const tbrsRegex = /\bTBRS\b\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi;
  let tbrsMatch = tbrsRegex.exec(text);
  while (tbrsMatch) {
    const fromAt = parseLegacyDate(tbrsMatch[1]);
    if (fromAt) {
      scheduleEvents.push({
        eventType: 'TBS_FROM',
        fromAt,
        toAt: null,
        rawSnippet: tbrsMatch[0],
        source: 'LEGACY_PARSE',
      });
      matchedSnippets.add(tbrsMatch[0]);
    } else {
      unparsedSignals.push(tbrsMatch[0]);
    }
    tbrsMatch = tbrsRegex.exec(text);
  }

  const requirementRules: Array<{
    regex: RegExp;
    typeCode: DetectedRequirement['typeCode'];
  }> = [
    { regex: /\bDTL\b/gi, typeCode: 'POLICE_DETAIL' },
    { regex: /\bCBP\b/gi, typeCode: 'CRANE_AND_BOOM_PERMIT' },
    { regex: /\bTREE\s+PERMIT(?:\s+NEEDED)?\b/gi, typeCode: 'TREE_PERMIT' },
  ];

  for (const rule of requirementRules) {
    let match = rule.regex.exec(text);
    while (match) {
      requirements.push({
        typeCode: rule.typeCode,
        rawSnippet: match[0],
        source: 'LEGACY_PARSE',
      });
      matchedSnippets.add(match[0]);
      match = rule.regex.exec(text);
    }
  }

  const pushUpPhraseRegex = /\bPUSH\s+UP\s+IF\s+POSSIBLE\b/i;
  const pushUpPuRegex = /\bPU\b/i;
  const pushUpSlashRegex = /\bP\/U\b/i;
  const mustBeFirstRegex = /\b(MUST\s+BE\s+1ST\s+JOB|WANTS\s+TO\s+BE\s+1ST\s+JOB)\b/i;
  const noEmailRegex = /\bNO\s+EMAIL\b/i;
  const ditchWitchRegex = /\bDW\b/i;

  const pushUpPhrase = text.match(pushUpPhraseRegex);
  if (pushUpPhrase) {
    pushUpIfPossible = true;
    confidence.pushUpIfPossible = maxConfidence(confidence.pushUpIfPossible, 95);
    matchedSnippets.add(pushUpPhrase[0]);
  }
  const pushUpPu = text.match(pushUpPuRegex);
  if (pushUpPu) {
    pushUpIfPossible = true;
    confidence.pushUpIfPossible = maxConfidence(confidence.pushUpIfPossible, 70);
    matchedSnippets.add(pushUpPu[0]);
  }
  const pushUpSlash = text.match(pushUpSlashRegex);
  if (pushUpSlash) {
    pushUpIfPossible = true;
    confidence.pushUpIfPossible = maxConfidence(confidence.pushUpIfPossible, 70);
    matchedSnippets.add(pushUpSlash[0]);
  }

  const mustBeFirst = text.match(mustBeFirstRegex);
  if (mustBeFirst) {
    mustBeFirstJob = true;
    confidence.mustBeFirstJob = 90;
    matchedSnippets.add(mustBeFirst[0]);
  }

  const noEmailMatch = text.match(noEmailRegex);
  if (noEmailMatch) {
    noEmail = true;
    confidence.noEmail = 95;
    matchedSnippets.add(noEmailMatch[0]);
  }

  const ditchWitchMatch = text.match(ditchWitchRegex);
  if (ditchWitchMatch) {
    ditchWitchSuggested = true;
    confidence.ditchWitchSuggested = 90;
    matchedSnippets.add(ditchWitchMatch[0]);
  }

  const hasRecognizedSignals =
    pushUpIfPossible ||
    mustBeFirstJob ||
    noEmail ||
    ditchWitchSuggested ||
    requirements.length > 0 ||
    scheduleEvents.length > 0;

  if (!hasRecognizedSignals) {
    const unknownSignals = text.match(/\b[A-Z][A-Z0-9/]{2,}\b/g) ?? [];
    for (const signal of unknownSignals) {
      if (
        signal !== 'DTL' &&
        signal !== 'CBP' &&
        signal !== 'TBRS' &&
        signal !== 'RS' &&
        signal !== 'PU' &&
        signal !== 'DW' &&
        signal !== 'EMAIL' &&
        signal !== 'TREE' &&
        !matchedSnippets.has(signal)
      ) {
        unparsedSignals.push(signal);
      }
    }
  }

  return {
    pushUpIfPossible,
    mustBeFirstJob,
    noEmail,
    requirements,
    ditchWitchSuggested,
    scheduleEvents,
    unparsedSignals: Array.from(new Set(unparsedSignals)),
    confidence,
  };
}
