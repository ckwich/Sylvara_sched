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

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
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

export default function DispatchClient() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [foremanPersonId, setForemanPersonId] = useState('4');
  const [date, setDate] = useState(todayIsoDate());
  const [data, setData] = useState<ForemanScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobId, setJobId] = useState('');
  const [rosterId, setRosterId] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
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

  const actorUserId = process.env.NEXT_PUBLIC_DEV_ACTOR_USER_ID;

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
    setScheduleDiagnostics((current) => ({
      ...current,
      url: buildForemanScheduleUrl(Number(foremanPersonId), date),
    }));
  }, [foremanPersonId, date]);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
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
    } catch (loadError) {
      if (loadError instanceof ApiRequestError) {
        setError(loadError.message);
        setScheduleDiagnostics({
          url: loadError.url,
          status: loadError.status,
          errorBody: loadError.body,
          networkErrorMessage: loadError.networkErrorMessage ?? null,
        });
      } else {
        setError(loadError instanceof Error ? loadError.message : 'UNKNOWN_ERROR: Failed to load schedule.');
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
      await createScheduleSegment(
        {
          jobId: parsedJobId,
          rosterId: parsedRosterId,
          startDatetime: toIsoFromLocalInput(startDatetime),
          endDatetime: toIsoFromLocalInput(endDatetime),
        },
        actorUserId,
      );
      await loadSchedule();
      setJobId('');
      setStartDatetime('');
      setEndDatetime('');
    } catch (submitError) {
      setCreateError(
        submitError instanceof Error
          ? submitError.message
          : 'UNKNOWN_ERROR: Failed to create segment.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 960 }}>
      <h1>Dispatch Day Viewer</h1>

      <section style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
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
        <button type="button" onClick={loadSchedule} disabled={loading}>
          {loading ? 'Loading...' : 'Load'}
        </button>
      </section>

      {error ? (
        <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>
      ) : null}
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
          <p>No active linked segments.</p>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Diagnostics</h2>
        <p>API base URL: {isHydrated ? (API_BASE_URL || '(same-origin)') : '(client-only)'}</p>
        <p>Timezone used for display: {companyTimezone}</p>
        <p>Timezone load error: {timezoneError ?? 'none'}</p>
        <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
{JSON.stringify(
  isHydrated
    ? {
        orgSettingsRequest: orgDiagnostics,
        foremanScheduleRequest: scheduleDiagnostics,
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
                    orgSettingsRequest: orgDiagnostics,
                    foremanScheduleRequest: scheduleDiagnostics,
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
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Segment'}
          </button>
        </form>
      </section>
    </main>
  );
}
