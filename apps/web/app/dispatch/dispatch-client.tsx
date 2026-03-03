'use client';

import { useEffect, useMemo, useState } from 'react';
import {
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

export default function DispatchClient() {
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
    let cancelled = false;
    async function loadTimezone() {
      try {
        const settings = await getOrgSettings();
        if (!cancelled) {
          setCompanyTimezone(settings.companyTimezone);
          setTimezoneError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCompanyTimezone(FALLBACK_TIMEZONE);
          setTimezoneError(
            loadError instanceof Error
              ? loadError.message
              : 'ORG_SETTINGS_ERROR: Failed to load company timezone.',
          );
        }
      }
    }
    void loadTimezone();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
    try {
      const parsedForemanId = Number(foremanPersonId);
      const response = await getForemanSchedule(parsedForemanId, date);
      setData(response);
      if (response.roster) {
        setRosterId(String(response.roster.id));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'UNKNOWN_ERROR: Failed to load schedule.');
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
          <p>No roster found for this foreman/date.</p>
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
