'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiRequestError, getJobs, type JobDerivedState, type JobSummary } from '../../lib/api';
import { buildSections } from './backlog-helpers';
import BacklogSection from './backlog-section';
import { NON_COMPLETED_STATES, STATE_LABELS, type EquipmentFilter, type EquipmentType } from './backlog-types';

export default function BacklogClient() {
  const [baseJobs, setBaseJobs] = useState<JobSummary[]>([]);
  const [completedJobs, setCompletedJobs] = useState<JobSummary[]>([]);
  const [completedLoaded, setCompletedLoaded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>('ALL');
  const [selectedStates, setSelectedStates] = useState<Set<JobDerivedState>>(
    () => new Set(NON_COMPLETED_STATES),
  );
  const [pushUpOnly, setPushUpOnly] = useState(false);
  const [repFilter, setRepFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<Record<EquipmentType, boolean>>({
    CRANE: true,
    BUCKET: true,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getJobs()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setBaseJobs(response.jobs.filter((job) => job.derivedState !== 'COMPLETED'));
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }
        const message =
          requestError instanceof ApiRequestError
            ? requestError.message
            : requestError instanceof Error
              ? requestError.message
              : 'Failed to load backlog.';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showCompleted || completedLoaded || loadingCompleted) {
      return;
    }

    let cancelled = false;
    setLoadingCompleted(true);
    void getJobs('COMPLETED')
      .then((response) => {
        if (cancelled) {
          return;
        }
        setCompletedJobs(response.jobs.filter((job) => job.derivedState === 'COMPLETED'));
        setCompletedLoaded(true);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }
        const message =
          requestError instanceof ApiRequestError
            ? requestError.message
            : requestError instanceof Error
              ? requestError.message
              : 'Failed to load completed jobs.';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCompleted(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showCompleted, completedLoaded, loadingCompleted]);

  const loadedJobs = useMemo(
    () => (showCompleted ? [...baseJobs, ...completedJobs] : baseJobs),
    [baseJobs, completedJobs, showCompleted],
  );

  const jobsBeforeRepFilter = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return loadedJobs.filter((job) => {
      if (equipmentFilter !== 'ALL' && job.equipmentType !== equipmentFilter) {
        return false;
      }
      if (job.derivedState !== 'COMPLETED' && !selectedStates.has(job.derivedState)) {
        return false;
      }
      if (job.derivedState === 'COMPLETED' && !showCompleted) {
        return false;
      }
      if (pushUpOnly && !job.pushUpIfPossible) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return (
        job.customerName.toLowerCase().includes(normalizedSearch) ||
        job.town.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [equipmentFilter, loadedJobs, pushUpOnly, search, selectedStates, showCompleted]);

  const repOptions = useMemo(
    () =>
      Array.from(new Set(jobsBeforeRepFilter.map((job) => job.salesRepCode || 'UNASSIGNED'))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [jobsBeforeRepFilter],
  );

  const visibleJobs = useMemo(() => {
    if (repFilter === 'ALL') {
      return jobsBeforeRepFilter;
    }
    return jobsBeforeRepFilter.filter((job) => (job.salesRepCode || 'UNASSIGNED') === repFilter);
  }, [jobsBeforeRepFilter, repFilter]);

  const sections = useMemo(() => buildSections(visibleJobs), [visibleJobs]);
  const hasVisibleRows = sections.some((section) => section.groups.some((group) => group.jobs.length > 0));

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-slate-900">Backlog</h1>
        <div className="mt-6 space-y-3">
          <div className="h-11 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Backlog</h1>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'CRANE', 'BUCKET'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEquipmentFilter(option)}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    equipmentFilter === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {option === 'ALL' ? 'All' : option === 'CRANE' ? 'Crane' : 'Bucket'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-slate-700">State</p>
            <div className="flex flex-wrap gap-2">
              {NON_COMPLETED_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() =>
                    setSelectedStates((previous) => {
                      const next = new Set(previous);
                      if (next.has(state)) {
                        next.delete(state);
                      } else {
                        next.add(state);
                      }
                      return next;
                    })
                  }
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    selectedStates.has(state) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {STATE_LABELS[state]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-end gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={pushUpOnly} onChange={(event) => setPushUpOnly(event.target.checked)} />
            Push-up only
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Rep
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
              value={repFilter}
              onChange={(event) => setRepFilter(event.target.value)}
            >
              <option value="ALL">All reps</option>
              {repOptions.map((repCode) => (
                <option key={repCode} value={repCode}>
                  {repCode}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Search
            <input
              type="text"
              placeholder="Customer or town"
              className="rounded-md border border-slate-300 px-2 py-1.5"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(event) => setShowCompleted(event.target.checked)}
            />
            Show Completed
          </label>
          {loadingCompleted ? <span className="text-sm text-slate-500">Loading completed jobs...</span> : null}
        </div>
      </section>

      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!hasVisibleRows ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No jobs found
        </div>
      ) : null}

      {sections.map((section) => (
        <BacklogSection
          key={section.equipmentType}
          section={section}
          equipmentFilter={equipmentFilter}
          isOpen={sectionOpen[section.equipmentType]}
          onToggle={(equipmentType) =>
            setSectionOpen((current) => ({
              ...current,
              [equipmentType]: !current[equipmentType],
            }))
          }
        />
      ))}
    </main>
  );
}
