'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ApiRequestError,
  createJob,
  getJobRepCodes,
  getJobs,
  type GetJobsQuery,
  type JobDerivedState,
  type JobSummary,
} from '../../lib/api';
import EditJobModal from '../jobs/edit-job-modal';
import { buildSections, formatDollars, formatHours, parseDecimal } from './backlog-helpers';
import BacklogSection from './backlog-section';
import { NON_COMPLETED_STATES, STATE_LABELS, type EquipmentFilter, type EquipmentType } from './backlog-types';

type NewJobFormState = {
  customerName: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  estimateHoursCurrent: string;
  amountDollars: string;
  salesRepCode: string;
  notesRaw: string;
};

const DEFAULT_PAGE_SIZE = 50;
const ADD_NEW_REP_VALUE = '__ADD_NEW_REP__';

export default function BacklogClient() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>('ALL');
  const [selectedStates, setSelectedStates] = useState<Set<JobDerivedState>>(
    () => new Set(NON_COMPLETED_STATES),
  );
  const [pushUpOnly, setPushUpOnly] = useState(false);
  const [repFilter, setRepFilter] = useState('ALL');
  const [townFilter, setTownFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<Record<EquipmentType, boolean>>({
    CRANE: true,
    BUCKET: true,
  });

  const [allRepCodes, setAllRepCodes] = useState<string[]>([]);

  const [newJobOpen, setNewJobOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newJobSubmitting, setNewJobSubmitting] = useState(false);
  const [newJobError, setNewJobError] = useState<string | null>(null);
  const [newJobCustomRepInput, setNewJobCustomRepInput] = useState(false);
  const [newJobForm, setNewJobForm] = useState<NewJobFormState>({
    customerName: '',
    town: '',
    equipmentType: 'CRANE',
    estimateHoursCurrent: '',
    amountDollars: '',
    salesRepCode: '',
    notesRaw: '',
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadRepCodes = useCallback(async () => {
    try {
      const codes = await getJobRepCodes();
      setAllRepCodes(codes);
    } catch {
      // Non-critical — filter dropdown will just be empty
    }
  }, []);

  useEffect(() => {
    void loadRepCodes();
  }, [loadRepCodes]);

  const requestQuery = useMemo<GetJobsQuery>(
    () => ({
      page,
      pageSize,
      includeCompleted: showCompleted,
      ...(equipmentFilter !== 'ALL' ? { equipmentType: equipmentFilter } : {}),
      ...(townFilter.trim() ? { town: townFilter.trim() } : {}),
      ...(repFilter !== 'ALL' ? { salesRepCode: repFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, showCompleted, equipmentFilter, townFilter, repFilter, debouncedSearch],
  );

  async function loadJobs(query: GetJobsQuery, showInitialLoading = false): Promise<void> {
    if (showInitialLoading) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    try {
      const response = await getJobs(query);
      setJobs(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
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
      setIsFetching(false);
    }
  }

  useEffect(() => {
    void loadJobs(requestQuery, loading);
  }, [requestQuery]);

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
      setPage(1);
      await Promise.all([loadJobs({ ...requestQuery, page: 1 }), loadRepCodes()]);
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

  const newJobRepOptions = useMemo(
    () =>
      Array.from(
        new Set(
          jobs
            .map((job) => job.salesRepCode.trim())
            .filter((code) => code.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (job.derivedState !== 'COMPLETED' && !selectedStates.has(job.derivedState)) {
          return false;
        }
        if (pushUpOnly && !job.pushUpIfPossible) {
          return false;
        }
        return true;
      }),
    [jobs, pushUpOnly, selectedStates],
  );

  // Count jobs per state from API-filtered results, applying pushUpOnly but NOT the state toggle.
  // This lets the state buttons show how many jobs are in each state before clicking.
  const stateCountsExcludingStateFilter = useMemo(() => {
    const counts: Record<string, number> = { TBS: 0, PARTIALLY_SCHEDULED: 0, FULLY_SCHEDULED: 0 };
    for (const job of jobs) {
      if (job.derivedState === 'COMPLETED') continue;
      if (pushUpOnly && !job.pushUpIfPossible) continue;
      counts[job.derivedState] = (counts[job.derivedState] ?? 0) + 1;
    }
    return counts;
  }, [jobs, pushUpOnly]);

  // Summary bar: aggregate by state from the visible (fully-filtered) jobs.
  const summaryByState = useMemo(() => {
    type StateSummary = { count: number; dollars: number; hours: number };
    const summary: Record<string, StateSummary> = {
      TBS: { count: 0, dollars: 0, hours: 0 },
      PARTIALLY_SCHEDULED: { count: 0, dollars: 0, hours: 0 },
      FULLY_SCHEDULED: { count: 0, dollars: 0, hours: 0 },
    };
    for (const job of visibleJobs) {
      if (job.derivedState === 'COMPLETED') continue;
      const bucket = summary[job.derivedState];
      if (!bucket) continue;
      bucket.count += 1;
      bucket.dollars += parseDecimal(job.amountDollars);
      bucket.hours += parseDecimal(job.estimateHoursCurrent);
    }
    return summary;
  }, [visibleJobs]);

  const repOptions = allRepCodes;

  const sections = useMemo(() => buildSections(visibleJobs), [visibleJobs]);
  const hasVisibleRows = sections.some((section) => section.groups.some((group) => group.jobs.length > 0));

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Backlog</h1>
        <div className="mt-6 space-y-3">
          <div className="h-11 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Backlog</h1>
        <button
          type="button"
          onClick={() => setNewJobOpen((open) => !open)}
          className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-green/25 transition-all duration-150 hover:bg-brand-green-dark"
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
                className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
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

      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'CRANE', 'BUCKET'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={equipmentFilter === option}
                  onClick={() => {
                    setEquipmentFilter(option);
                    setPage(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                    equipmentFilter === option ? 'bg-brand-green text-white shadow-sm shadow-brand-green/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              {NON_COMPLETED_STATES.map((state) => {
                const count = stateCountsExcludingStateFilter[state] ?? 0;
                return (
                  <button
                    key={state}
                    type="button"
                    aria-pressed={selectedStates.has(state)}
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
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                      selectedStates.has(state) ? 'bg-brand-green text-white shadow-sm shadow-brand-green/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {STATE_LABELS[state]}
                    <span
                      className={`ml-1.5 inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                        selectedStates.has(state)
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
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
              onChange={(event) => {
                setRepFilter(event.target.value);
                setPage(1);
              }}
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
            Town
            <input
              type="text"
              placeholder="Town"
              className="rounded-md border border-slate-300 px-2 py-1.5"
              value={townFilter}
              onChange={(event) => {
                setTownFilter(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Search
            <input
              type="text"
              placeholder="Customer or address"
              className="rounded-md border border-slate-300 px-2 py-1.5"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(event) => {
                setShowCompleted(event.target.checked);
                setPage(1);
              }}
            />
            Show Completed
          </label>
          {isFetching ? <span className="text-sm text-slate-500">Loading...</span> : null}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">TBS</p>
          <p className="mt-1 text-lg font-semibold text-slate-700">
            {summaryByState.TBS.count} <span className="text-sm font-normal text-slate-500">jobs</span>
          </p>
          <p className="text-sm text-slate-500">
            {formatDollars(summaryByState.TBS.dollars)} · {formatHours(summaryByState.TBS.hours)}h
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Partial</p>
          <p className="mt-1 text-lg font-semibold text-amber-800">
            {summaryByState.PARTIALLY_SCHEDULED.count} <span className="text-sm font-normal text-amber-600">jobs</span>
          </p>
          <p className="text-sm text-amber-600">
            {formatDollars(summaryByState.PARTIALLY_SCHEDULED.dollars)} · {formatHours(summaryByState.PARTIALLY_SCHEDULED.hours)}h
          </p>
        </div>
        <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-green">Full</p>
          <p className="mt-1 text-lg font-semibold text-brand-green-dark">
            {summaryByState.FULLY_SCHEDULED.count} <span className="text-sm font-normal text-brand-green">jobs</span>
          </p>
          <p className="text-sm text-brand-green">
            {formatDollars(summaryByState.FULLY_SCHEDULED.dollars)} · {formatHours(summaryByState.FULLY_SCHEDULED.hours)}h
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="text-slate-600">
          {total} jobs total • Page {page} of {Math.max(totalPages, 1)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={isFetching || (totalPages > 0 && page >= totalPages)}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!hasVisibleRows ? (
        <div className="mt-8 rounded-xl border border-slate-200/80 bg-white px-8 py-14 text-center">
          <p className="text-base font-medium text-slate-500">No jobs found</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : null}

      {sections.map((section) => (
        <BacklogSection
          key={section.equipmentType}
          section={section}
          equipmentFilter={equipmentFilter}
          isOpen={sectionOpen[section.equipmentType]}
          onEditJob={(jobId) => setEditingJobId(jobId)}
          onToggle={(equipmentType) =>
            setSectionOpen((current) => ({
              ...current,
              [equipmentType]: !current[equipmentType],
            }))
          }
        />
      ))}

      <EditJobModal
        open={editingJobId !== null}
        jobId={editingJobId}
        salesRepCodes={newJobRepOptions}
        onClose={() => setEditingJobId(null)}
        onSaved={() => loadJobs(requestQuery)}
      />
    </main>
  );
}
