'use client';

import { useMemo, useState } from 'react';
import type { JobSummary } from '../../lib/api';

type JobSelectorPanelProps = {
  open: boolean;
  foremanName: string;
  date: string;
  clickedTimeLabel: string;
  jobs: JobSummary[];
  onClose: () => void;
  onSchedule: (input: {
    jobId: string;
    durationMinutes: number;
    travelBeforeMinutes: number;
    travelAfterMinutes: number;
  }) => Promise<void>;
  submitting: boolean;
  rejection: string | null;
  warnings: string[];
};

function parseHoursToMinutes(value: string | null): number {
  if (!value) {
    return 60;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 60;
  }
  return Math.max(10, Math.ceil((numeric * 60) / 10) * 10);
}

function formatHoursLabel(value: string | null): string {
  if (!value) {
    return '-';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '-';
  }
  return `${numeric.toFixed(2)}h`;
}

export default function JobSelectorPanel(props: JobSelectorPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [addTravel, setAddTravel] = useState(false);
  const [travelBeforeMinutes, setTravelBeforeMinutes] = useState(0);
  const [travelAfterMinutes, setTravelAfterMinutes] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const visibleJobs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return props.jobs
      .filter((job) => job.derivedState === 'TBS' || job.derivedState === 'PARTIALLY_SCHEDULED')
      .filter((job) => {
        if (!normalized) {
          return true;
        }
        return (
          job.customerName.toLowerCase().includes(normalized) ||
          job.town.toLowerCase().includes(normalized)
        );
      });
  }, [props.jobs, search]);

  const selectedJob = useMemo(
    () => visibleJobs.find((job) => job.id === selectedJobId) ?? null,
    [selectedJobId, visibleJobs],
  );

  function handleSelectJob(jobId: string) {
    setSelectedJobId(jobId);
    const job = visibleJobs.find((candidate) => candidate.id === jobId);
    if (job) {
      setDurationMinutes(parseHoursToMinutes(job.remainingHours));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!selectedJobId) {
      setLocalError('Select a job first.');
      return;
    }
    if (durationMinutes <= 0 || durationMinutes % 10 !== 0) {
      setLocalError('Duration must be a positive 10-minute increment.');
      return;
    }

    await props.onSchedule({
      jobId: selectedJobId,
      durationMinutes,
      travelBeforeMinutes: addTravel ? travelBeforeMinutes : 0,
      travelAfterMinutes: addTravel ? travelAfterMinutes : 0,
    });
  }

  if (!props.open) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-slate-200 bg-white shadow-xl">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <header className="border-b border-slate-200 p-4">
          <p className="text-sm text-slate-500">Schedule a Job</p>
          <h2 className="text-lg font-semibold text-slate-900">
            {props.foremanName}, {props.date} at {props.clickedTimeLabel}
          </h2>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <label className="block text-sm font-medium text-slate-700">
            Search
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer or town"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-2">
            {visibleJobs.length === 0 ? <p className="text-sm text-slate-500">No matching jobs.</p> : null}
            {visibleJobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJob(job.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  selectedJobId === job.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <p className="font-medium text-slate-900">{job.customerName}</p>
                <p className="text-xs text-slate-600">
                  {job.town} - {job.equipmentType} - Remaining {formatHoursLabel(job.remainingHours)}{' '}
                  {job.pushUpIfPossible ? ' - Push-up' : ''}
                </p>
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Duration (minutes)
            <input
              type="number"
              step={10}
              min={10}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          {selectedJob ? (
            <p className="text-xs text-slate-500">
              Remaining hours: {formatHoursLabel(selectedJob.remainingHours)}. Duration defaults to remaining hours
              rounded up to 10 minutes.
            </p>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={addTravel}
              onChange={(event) => setAddTravel(event.target.checked)}
            />
            Add travel time?
          </label>

          {addTravel ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-700">
                Travel before
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={travelBeforeMinutes}
                  onChange={(event) => setTravelBeforeMinutes(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Travel after
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={travelAfterMinutes}
                  onChange={(event) => setTravelAfterMinutes(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          ) : null}

          {localError ? <p className="text-sm text-red-700">{localError}</p> : null}
          {props.rejection ? <p className="text-sm text-red-700">{props.rejection}</p> : null}
          {props.warnings.map((warning) => (
            <p key={warning} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {warning}
            </p>
          ))}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={props.submitting}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {props.submitting ? 'Scheduling...' : 'Schedule'}
          </button>
        </footer>
      </form>
    </aside>
  );
}
