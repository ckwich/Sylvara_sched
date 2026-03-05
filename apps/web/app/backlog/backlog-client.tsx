'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ApiRequestError, createJob, getJobs, type JobDerivedState, type JobSummary } from '../../lib/api';
import { buildSections } from './backlog-helpers';
import BacklogSection from './backlog-section';
import { NON_COMPLETED_STATES, STATE_LABELS, type EquipmentFilter, type EquipmentType } from './backlog-types';

export default function BacklogClient() {
  const ADD_NEW_REP_VALUE = '__ADD_NEW_REP__';
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
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [newJobSubmitting, setNewJobSubmitting] = useState(false);
  const [newJobError, setNewJobError] = useState<string | null>(null);
  const [newJobCustomRepInput, setNewJobCustomRepInput] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    customerName: '',
    town: '',
    equipmentType: 'CRANE' as const,
    estimateHoursCurrent: '',
    amountDollars: '',
    salesRepCode: '',
    notesRaw: '',
  });

  async function loadBaseJobs(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await getJobs();
      setBaseJobs(response.jobs.filter((job) => job.derivedState !== 'COMPLETED'));
    } catch (requestError) {
      const message =
        requestError instanceof ApiRequestError
          ? requestError.message
          : requestError instanceof Error
            ? requestError.message
            : 'Failed to load backlog.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBaseJobs();
  }, []);

  async function handleCreateJobSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewJobError(null);

    const estimate = Number(newJobForm.estimateHoursCurrent);
    const amount = Number(newJobForm.amountDollars);
    if (
      !newJobForm.customerName.trim() ||
      !newJobForm.town.trim() ||
      !newJobForm.salesRepCode.trim() ||
      Number.isNaN(estimate) ||
      Number.isNaN(amount)
    ) {
      setNewJobError('Please complete all required fields.');
      return;
    }

    setNewJobSubmitting(true);
    try {
      await createJob({
        customerName: newJobForm.customerName.trim(),
        town: newJobForm.town.trim(),
        equipmentType: newJobForm.equipmentType,
        estimateHoursCurrent: estimate,
        amountDollars: amount,
        salesRepCode: newJobForm.salesRepCode.trim(),
        notesRaw: newJobForm.notesRaw.trim() || undefined,
      });
      setNewJobForm({
        customerName: '',
        town: '',
        equipmentType: 'CRANE',
        estimateHoursCurrent: '',
        amountDollars: '',
        salesRepCode: '',
        notesRaw: '',
      });
      setNewJobCustomRepInput(false);
      setNewJobOpen(false);
      await loadBaseJobs();
    } catch (requestError) {
      const message =
        requestError instanceof ApiRequestError
          ? requestError.message
          : requestError instanceof Error
            ? requestError.message
            : 'Failed to create job.';
      setNewJobError(message);
    } finally {
      setNewJobSubmitting(false);
    }
  }

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
  const newJobRepOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [...baseJobs, ...completedJobs]
            .map((job) => job.salesRepCode.trim())
            .filter((code) => code.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [baseJobs, completedJobs],
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">Backlog</h1>
        <button
          type="button"
          onClick={() => setNewJobOpen((open) => !open)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          New Job
        </button>
      </div>

      {newJobOpen ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateJobSubmit}>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Customer name
              <input
                required
                type="text"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={newJobForm.customerName}
                onChange={(event) => setNewJobForm((current) => ({ ...current, customerName: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Town
              <input
                required
                type="text"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={newJobForm.town}
                onChange={(event) => setNewJobForm((current) => ({ ...current, town: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Equipment type
              <select
                required
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
                value={newJobForm.equipmentType}
                onChange={(event) =>
                  setNewJobForm((current) => ({
                    ...current,
                    equipmentType: event.target.value as 'CRANE' | 'BUCKET',
                  }))
                }
              >
                <option value="CRANE">CRANE</option>
                <option value="BUCKET">BUCKET</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Estimated hours
              <input
                required
                type="number"
                min="0"
                step="0.1"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={newJobForm.estimateHoursCurrent}
                onChange={(event) =>
                  setNewJobForm((current) => ({ ...current, estimateHoursCurrent: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Dollar amount
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={newJobForm.amountDollars}
                onChange={(event) => setNewJobForm((current) => ({ ...current, amountDollars: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Sales rep code
              {newJobCustomRepInput ? (
                <div className="space-y-2">
                  <input
                    required
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                    value={newJobForm.salesRepCode}
                    onChange={(event) =>
                      setNewJobForm((current) => ({ ...current, salesRepCode: event.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="text-xs text-slate-600 underline"
                    onClick={() => {
                      setNewJobCustomRepInput(false);
                      setNewJobForm((current) => ({ ...current, salesRepCode: '' }));
                    }}
                  >
                    Choose existing rep instead
                  </button>
                </div>
              ) : (
                <select
                  required
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
                  value={
                    newJobForm.salesRepCode && newJobRepOptions.includes(newJobForm.salesRepCode)
                      ? newJobForm.salesRepCode
                      : ''
                  }
                  onChange={(event) => {
                    if (event.target.value === ADD_NEW_REP_VALUE) {
                      setNewJobCustomRepInput(true);
                      setNewJobForm((current) => ({ ...current, salesRepCode: '' }));
                      return;
                    }
                    setNewJobForm((current) => ({ ...current, salesRepCode: event.target.value }));
                  }}
                >
                  <option value="">Select rep...</option>
                  {newJobRepOptions.map((repCode) => (
                    <option key={repCode} value={repCode}>
                      {repCode}
                    </option>
                  ))}
                  <option value={ADD_NEW_REP_VALUE}>Add new rep code...</option>
                </select>
              )}
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
              Notes
              <textarea
                rows={3}
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={newJobForm.notesRaw}
                onChange={(event) => setNewJobForm((current) => ({ ...current, notesRaw: event.target.value }))}
              />
            </label>
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={newJobSubmitting}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {newJobSubmitting ? 'Saving...' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => setNewJobOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
            {newJobError ? (
              <p className="md:col-span-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{newJobError}</p>
            ) : null}
          </form>
        </section>
      ) : null}

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
