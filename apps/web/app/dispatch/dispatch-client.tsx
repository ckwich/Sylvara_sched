'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  API_BASE_URL,
  ApiRequestError,
  buildForemanScheduleUrl,
  buildOrgSettingsUrl,
  createScheduleSegment,
  getForemanSchedule,
  getOrgSettings,
  type ForemanScheduleResponse,
} from '../../lib/api';

const FALLBACK_TIMEZONE = 'UTC';
const DISPATCH_PREFS_STORAGE_KEY = 'sylvara.dispatchPrefs';
const LAN_USER_STORAGE_KEY = 'sylvara.lanUser';

const ERROR_HINTS: Record<string, string> = {
  UNAUTHENTICATED: 'Missing/invalid LAN key or LAN user. Check env + header.',
  SCHEDULE_CONFLICT: 'Overlaps existing booking. Move start/end or delete conflicting segment.',
  JOB_NOT_FOUND: 'Job does not exist; verify jobId.',
};

function isoDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function todayIsoDate(timeZone: string = FALLBACK_TIMEZONE): string {
  return isoDateInTimeZone(new Date(), timeZone);
}

function formatDateTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function isTenMinuteAligned(value: string): boolean {
  if (!value) {
    return false;
  }
  const minute = Number(value.split(':')[1]);
  return Number.isInteger(minute) && minute % 10 === 0;
}

function toIsoFromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

type RequestDiagnostics = {
  url: string;
  status: number | null;
  errorBody: unknown | null;
  networkErrorMessage?: string | null;
};

type DiagnosticsView = {
  url: string;
  status: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  networkErrorMessage: string | null;
  errorBody?: unknown | null;
};

function extractErrorSummary(errorBody: unknown): { errorCode: string | null; errorMessage: string | null } {
  if (!errorBody || typeof errorBody !== 'object') {
    return { errorCode: null, errorMessage: null };
  }
  const error = (errorBody as { error?: { code?: unknown; message?: unknown } }).error;
  const errorCode = typeof error?.code === 'string' ? error.code : null;
  const errorMessage = typeof error?.message === 'string' ? error.message : null;
  return { errorCode, errorMessage };
}

function buildDiagnosticsView(
  diagnostics: RequestDiagnostics,
  includeRawDetails: boolean,
): DiagnosticsView {
  const summary = extractErrorSummary(diagnostics.errorBody);
  return {
    url: diagnostics.url,
    status: diagnostics.status,
    errorCode: summary.errorCode,
    errorMessage: summary.errorMessage,
    networkErrorMessage: diagnostics.networkErrorMessage ?? null,
    ...(includeRawDetails ? { errorBody: diagnostics.errorBody } : {}),
  };
}

function errorHintForCode(input: { code: string | null; details?: unknown }): string | null {
  if (!input.code) {
    return null;
  }

  if (input.code === 'VALIDATION_ERROR') {
    if (input.details && typeof input.details === 'object') {
      const fieldNames = Object.keys(input.details as Record<string, unknown>);
      if (fieldNames.length > 0) {
        return `Check input fields: ${fieldNames.join(', ')}.`;
      }
    }
    return 'Validation failed. Check field formats (timezone, minutes alignment, IDs).';
  }

  return ERROR_HINTS[input.code] ?? null;
}

function describeError(error: unknown): { message: string; hint: string | null } {
  if (error instanceof ApiRequestError) {
    const body = error.body as { error?: { code?: string; details?: unknown } } | null;
    const codeFromBody = body?.error?.code ?? null;
    const codeFromMessage = /^([A-Z0-9_]+):/.exec(error.message)?.[1] ?? null;
    const code = codeFromBody ?? codeFromMessage;
    return {
      message: error.message,
      hint: errorHintForCode({ code, details: body?.error?.details }),
    };
  }

  return {
    message: error instanceof Error ? error.message : 'UNKNOWN_ERROR: Request failed.',
    hint: null,
  };
}

type DispatchClientProps = {
  lanModeEnabled: boolean;
};

export default function DispatchClient({ lanModeEnabled }: DispatchClientProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [foremanPersonId, setForemanPersonId] = useState('4');
  const [date, setDate] = useState(todayIsoDate(FALLBACK_TIMEZONE));
  const [data, setData] = useState<ForemanScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const [jobId, setJobId] = useState('');
  const [rosterId, setRosterId] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createErrorHint, setCreateErrorHint] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [companyTimezone, setCompanyTimezone] = useState(FALLBACK_TIMEZONE);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);
  const [orgDiagnostics, setOrgDiagnostics] = useState<RequestDiagnostics>({
    url: buildOrgSettingsUrl(),
    status: null,
    errorBody: null,
    networkErrorMessage: null,
  });
  const [scheduleDiagnostics, setScheduleDiagnostics] = useState<RequestDiagnostics>({
    url: buildForemanScheduleUrl(Number(foremanPersonId), date),
    status: null,
    errorBody: null,
    networkErrorMessage: null,
  });
  const [lanUser, setLanUser] = useState('');
  const [showDebugDetails, setShowDebugDetails] = useState(false);
  const [hasStoredDatePreference, setHasStoredDatePreference] = useState(false);

  const actorUserId = process.env.NEXT_PUBLIC_DEV_ACTOR_USER_ID;
  const canExpandDebugDetails = process.env.NODE_ENV !== 'production' && !lanModeEnabled;

  const createValidationError = useMemo(() => {
    if (!startDatetime || !endDatetime) {
      return null;
    }
    if (!isTenMinuteAligned(startDatetime) || !isTenMinuteAligned(endDatetime)) {
      return 'INVALID_INCREMENT: Start and end must be on 10-minute boundaries.';
    }
    return null;
  }, [startDatetime, endDatetime]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const rawPrefs = window.localStorage.getItem(DISPATCH_PREFS_STORAGE_KEY);
      if (rawPrefs) {
        const parsed = JSON.parse(rawPrefs) as { foremanPersonId?: string; date?: string };
        if (parsed.foremanPersonId) {
          setForemanPersonId(parsed.foremanPersonId);
        }
        if (parsed.date) {
          setDate(parsed.date);
          setHasStoredDatePreference(true);
        }
      }
    } catch {
      // ignore malformed local preferences
    }

    if (!lanModeEnabled) {
      return;
    }
    const stored = window.localStorage.getItem(LAN_USER_STORAGE_KEY);
    if (stored) {
      setLanUser(stored);
    }
  }, [lanModeEnabled]);

  useEffect(() => {
    if (!isHydrated || hasStoredDatePreference) {
      return;
    }

    let cancelled = false;
    async function loadDefaultDate() {
      try {
        const settings = await getOrgSettings();
        if (!cancelled) {
          setCompanyTimezone(settings.companyTimezone);
          setDate(todayIsoDate(settings.companyTimezone));
        }
      } catch {
        if (!cancelled) {
          setDate(todayIsoDate(FALLBACK_TIMEZONE));
        }
      }
    }

    void loadDefaultDate();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, hasStoredDatePreference]);

  useEffect(() => {
    setScheduleDiagnostics((current) => ({
      ...current,
      url: buildForemanScheduleUrl(Number(foremanPersonId), date),
    }));
  }, [foremanPersonId, date]);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
    setErrorHint(null);
    const parsedForemanId = Number(foremanPersonId);
    const orgUrl = buildOrgSettingsUrl();
    const scheduleUrl = buildForemanScheduleUrl(parsedForemanId, date);
    setOrgDiagnostics({ url: orgUrl, status: null, errorBody: null, networkErrorMessage: null });
    setScheduleDiagnostics({
      url: scheduleUrl,
      status: null,
      errorBody: null,
      networkErrorMessage: null,
    });

    try {
      try {
        const settings = await getOrgSettings();
        setCompanyTimezone(settings.companyTimezone);
        setTimezoneError(null);
        setOrgDiagnostics({ url: orgUrl, status: 200, errorBody: null, networkErrorMessage: null });
      } catch (orgError) {
        setCompanyTimezone(FALLBACK_TIMEZONE);
        if (orgError instanceof ApiRequestError) {
          setTimezoneError(orgError.message);
          setOrgDiagnostics({
            url: orgError.url,
            status: orgError.status,
            errorBody: orgError.body,
            networkErrorMessage: orgError.networkErrorMessage ?? null,
          });
        } else {
          setTimezoneError('ORG_SETTINGS_ERROR: Failed to load company timezone.');
          setOrgDiagnostics({
            url: orgUrl,
            status: null,
            errorBody: String(orgError),
            networkErrorMessage: null,
          });
        }
      }

      const response = await getForemanSchedule(parsedForemanId, date);
      setData(response);
      setScheduleDiagnostics({
        url: scheduleUrl,
        status: 200,
        errorBody: null,
        networkErrorMessage: null,
      });
      if (response.roster) {
        setRosterId(String(response.roster.id));
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          DISPATCH_PREFS_STORAGE_KEY,
          JSON.stringify({ foremanPersonId, date }),
        );
      }
    } catch (loadError) {
      const described = describeError(loadError);
      setError(described.message);
      setErrorHint(described.hint);
      if (loadError instanceof ApiRequestError) {
        setScheduleDiagnostics({
          url: loadError.url,
          status: loadError.status,
          errorBody: loadError.body,
          networkErrorMessage: loadError.networkErrorMessage ?? null,
        });
      } else {
        setScheduleDiagnostics({
          url: scheduleUrl,
          status: null,
          errorBody: String(loadError),
          networkErrorMessage: null,
        });
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateErrorHint(null);

    if (createValidationError) {
      setCreateError(createValidationError);
      return;
    }

    const parsedJobId = Number(jobId);
    const parsedRosterId = Number(rosterId);
    if (!Number.isInteger(parsedJobId) || parsedJobId <= 0) {
      setCreateError('VALIDATION_ERROR: jobId must be a positive integer.');
      return;
    }
    if (!Number.isInteger(parsedRosterId) || parsedRosterId <= 0) {
      setCreateError('VALIDATION_ERROR: rosterId must be a positive integer.');
      return;
    }
    if (!startDatetime || !endDatetime) {
      setCreateError('VALIDATION_ERROR: startDatetime and endDatetime are required.');
      return;
    }

    setCreating(true);
    try {
      const normalizedLanUser = lanModeEnabled ? lanUser.trim() : '';
      if (lanModeEnabled && !normalizedLanUser) {
        setCreateError('UNAUTHENTICATED: LAN User is required in LAN mode.');
        return;
      }
      await createScheduleSegment(
        {
          jobId: parsedJobId,
          rosterId: parsedRosterId,
          startDatetime: toIsoFromLocalInput(startDatetime),
          endDatetime: toIsoFromLocalInput(endDatetime),
        },
        actorUserId,
        normalizedLanUser || undefined,
      );
      if (lanModeEnabled) {
        window.localStorage.setItem(LAN_USER_STORAGE_KEY, normalizedLanUser);
      }
      await loadSchedule();
      setJobId('');
      setStartDatetime('');
      setEndDatetime('');
    } catch (submitError) {
      const described = describeError(submitError);
      setCreateError(described.message);
      setCreateErrorHint(described.hint);
    } finally {
      setCreating(false);
    }
  }

  function onLoadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadSchedule();
  }

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 960 }}>
      <h1>Dispatch Day Viewer</h1>

      <form
        onSubmit={onLoadSubmit}
        style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}
      >
        <label>
          Foreman Person ID
          <input
            type="number"
            min={1}
            value={foremanPersonId}
            onChange={(event) => setForemanPersonId(event.target.value)}
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Load'}
        </button>
        {lanModeEnabled ? (
          <label>
            LAN User
            <input
              type="text"
              value={lanUser}
              onChange={(event) => setLanUser(event.target.value)}
              placeholder="Your name"
            />
          </label>
        ) : null}
      </form>

      {error ? (
        <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>
      ) : null}
      {errorHint ? <p style={{ color: '#8a4b00', marginTop: 4 }}>{errorHint}</p> : null}
      {timezoneError ? (
        <p style={{ color: 'crimson', marginTop: 12 }}>
          Company timezone unavailable. Showing UTC. {timezoneError}
        </p>
      ) : null}

      <section style={{ marginTop: 16 }}>
        <h2>Roster</h2>
        {data?.roster ? (
          <pre>{JSON.stringify(data.roster, null, 2)}</pre>
        ) : (
          <p>
            No roster found for this foreman/date. Schedule is roster-linked, so segments will
            not appear without a roster + link.
          </p>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Schedule Segments ({companyTimezone})</h2>
        {data?.scheduleSegments?.length ? (
          <ul>
            {data.scheduleSegments.map((segment) => (
              <li key={segment.id}>
                #{segment.id} job {segment.jobId} [{segment.segmentType}] {formatDateTime(segment.startDatetime, companyTimezone)} -{' '}
                {formatDateTime(segment.endDatetime, companyTimezone)}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {data?.roster
              ? 'Roster exists, but there are no active linked segments. Create a segment or verify segment-roster links.'
              : 'No active linked segments.'}
          </p>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Diagnostics</h2>
        <p>Request mode: {isHydrated ? '/api/* (same-origin rewrite proxy)' : '(client-only)'}</p>
        <p>API base URL: {isHydrated ? (API_BASE_URL || '(browser uses relative /api)') : '(client-only)'}</p>
        <p>Timezone used for display: {companyTimezone}</p>
        <p>Timezone load error: {timezoneError ?? 'none'}</p>
        {!canExpandDebugDetails ? <p>Raw debug details are hidden in LAN mode.</p> : null}
        {canExpandDebugDetails ? (
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={showDebugDetails}
              onChange={(event) => setShowDebugDetails(event.target.checked)}
            />{' '}
            Expand debug details
          </label>
        ) : null}
        <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
{JSON.stringify(
  isHydrated
    ? {
        orgSettingsRequest: buildDiagnosticsView(
          orgDiagnostics,
          canExpandDebugDetails && showDebugDetails,
        ),
        foremanScheduleRequest: buildDiagnosticsView(
          scheduleDiagnostics,
          canExpandDebugDetails && showDebugDetails,
        ),
      }
    : {
        orgSettingsRequest: { url: '(client-only)', status: null, errorBody: null },
        foremanScheduleRequest: { url: '(client-only)', status: null, errorBody: null },
      },
  null,
  2,
)}
        </pre>
        <label style={{ display: 'block', marginTop: 8 }}>
          Copy debug info
          <textarea
            readOnly
            value={JSON.stringify(
              isHydrated
                ? {
                    foremanPersonId,
                    date,
                    apiBaseUrl: API_BASE_URL || '(same-origin)',
                    timezoneUsed: companyTimezone,
                    timezoneError,
                    orgSettingsRequest: buildDiagnosticsView(
                      orgDiagnostics,
                      canExpandDebugDetails && showDebugDetails,
                    ),
                    foremanScheduleRequest: buildDiagnosticsView(
                      scheduleDiagnostics,
                      canExpandDebugDetails && showDebugDetails,
                    ),
                  }
                : {
                    foremanPersonId,
                    date,
                    apiBaseUrl: '(client-only)',
                    timezoneUsed: companyTimezone,
                    timezoneError,
                    orgSettingsRequest: { url: '(client-only)', status: null, errorBody: null },
                    foremanScheduleRequest: { url: '(client-only)', status: null, errorBody: null },
                  },
              null,
              2,
            )}
            rows={12}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </label>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Create Segment</h2>
        <form onSubmit={submitCreate} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
          <label>
            Job ID
            <input type="number" min={1} value={jobId} onChange={(event) => setJobId(event.target.value)} />
          </label>
          <label>
            Roster ID
            <input
              type="number"
              min={1}
              value={rosterId}
              onChange={(event) => setRosterId(event.target.value)}
            />
          </label>
          <label>
            Start Datetime
            <input
              type="datetime-local"
              value={startDatetime}
              onChange={(event) => setStartDatetime(event.target.value)}
            />
          </label>
          <label>
            End Datetime
            <input
              type="datetime-local"
              value={endDatetime}
              onChange={(event) => setEndDatetime(event.target.value)}
            />
          </label>
          {createError ? <p style={{ color: 'crimson' }}>{createError}</p> : null}
          {createErrorHint ? <p style={{ color: '#8a4b00' }}>{createErrorHint}</p> : null}
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Segment'}
          </button>
        </form>
      </section>
    </main>
  );
}
