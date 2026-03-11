'use client';

import { useEffect, useMemo, useState } from 'react';
import { utcToLocalParts } from '@sylvara/shared';
import {
  applyPushupSuggestion,
  dismissPushupSuggestion,
  getPushupCandidates,
  type PushupCandidate,
  type PushupVacatedSlotSummary,
} from '../../lib/api';

type PushupModalProps = {
  open: boolean;
  vacatedSlotId: string | null;
  companyTimezone: string;
  onClose: () => void;
  onApplied: () => Promise<void>;
};

function formatLocalTime(iso: string, timezone: string): string {
  const parts = utcToLocalParts(new Date(iso), timezone);
  const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
  const suffix = parts.hour >= 12 ? 'PM' : 'AM';
  const min = String(parts.minute).padStart(2, '0');
  return `${hour12}:${min} ${suffix}`;
}

function formatLocalDate(iso: string, timezone: string): string {
  const parts = utcToLocalParts(new Date(iso), timezone);
  return `${parts.month}/${parts.day}/${parts.year}`;
}

function formatDateTimeWindow(slot: PushupVacatedSlotSummary, timezone: string): string {
  return `${formatLocalDate(slot.startDatetime, timezone)} ${formatLocalTime(slot.startDatetime, timezone)} - ${formatLocalTime(slot.endDatetime, timezone)}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Request failed.';
}

export default function PushupModal(props: PushupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<PushupVacatedSlotSummary | null>(null);
  const [candidates, setCandidates] = useState<PushupCandidate[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [resultByJob, setResultByJob] = useState<Record<string, string>>({});
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!props.open || !props.vacatedSlotId) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getPushupCandidates(props.vacatedSlotId)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setSlot(response.vacatedSlot);
        setCandidates(response.candidates);
        setAllocations(
          Object.fromEntries(response.candidates.map((candidate) => [candidate.jobId, candidate.allocatedHours])),
        );
        setAppliedJobs(new Set());
        setResultByJob({});
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }
        setError(errorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.open, props.vacatedSlotId]);

  const sortedCandidates = useMemo(
    () => [...candidates].sort((a, b) => a.tier - b.tier || b.allocatedHours - a.allocatedHours),
    [candidates],
  );

  if (!props.open || !props.vacatedSlotId) {
    return null;
  }

  const onApply = async (candidate: PushupCandidate) => {
    if (!slot) {
      return;
    }
    setBusyJobId(candidate.jobId);
    setResultByJob((prev) => ({ ...prev, [candidate.jobId]: '' }));
    try {
      const allocatedHours = allocations[candidate.jobId] ?? candidate.allocatedHours;
      const response = await applyPushupSuggestion({
        vacatedSlotId: slot.id,
        jobId: candidate.jobId,
        allocatedHours,
        startDatetime: slot.startDatetime,
      });

      if (response.result === 'REJECT') {
        setResultByJob((prev) => ({
          ...prev,
          [candidate.jobId]: response.error?.message ?? 'Request rejected.',
        }));
        return;
      }

      setAppliedJobs((prev) => new Set([...prev, candidate.jobId]));
      setResultByJob((prev) => ({ ...prev, [candidate.jobId]: 'Scheduled' }));
      await props.onApplied();
    } catch (applyError) {
      setResultByJob((prev) => ({ ...prev, [candidate.jobId]: errorMessage(applyError) }));
    } finally {
      setBusyJobId(null);
    }
  };

  const onDismiss = async () => {
    if (!slot) {
      props.onClose();
      return;
    }
    setDismissing(true);
    try {
      await dismissPushupSuggestion(slot.id);
      props.onClose();
    } catch (dismissError) {
      setError(errorMessage(dismissError));
    } finally {
      setDismissing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/30">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Push-up Suggestions</h2>
            {slot ? (
              <p className="text-sm text-slate-600">
                {formatDateTimeWindow(slot, props.companyTimezone)} · {slot.slotHours.toFixed(2)} hrs · {slot.equipmentType}
              </p>
            ) : null}
          </div>
          <button type="button" onClick={props.onClose} className="rounded border border-slate-300 px-2 py-1 text-sm">
            Close
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading candidates...</p> : null}
        {error ? (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => {
                setError(null);
                if (props.vacatedSlotId) {
                  setLoading(true);
                  void getPushupCandidates(props.vacatedSlotId)
                    .then((response) => {
                      setSlot(response.vacatedSlot);
                      setCandidates(response.candidates);
                      setAllocations(
                        Object.fromEntries(response.candidates.map((candidate) => [candidate.jobId, candidate.allocatedHours])),
                      );
                    })
                    .catch((retryError) => setError(errorMessage(retryError)))
                    .finally(() => setLoading(false));
                }
              }}
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && sortedCandidates.length === 0 ? (
          <p className="rounded border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            No push-up candidates found for this slot.
          </p>
        ) : null}

        <div className="space-y-3">
          {sortedCandidates.map((candidate) => {
            const applied = appliedJobs.has(candidate.jobId);
            return (
              <article
                key={candidate.jobId}
                className={`rounded border p-3 ${applied ? 'border-emerald-300 bg-emerald-50 opacity-80' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{candidate.customerName}</p>
                    <p className="text-sm text-slate-600">
                      {candidate.jobSiteAddress}, {candidate.town}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${candidate.tier === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {candidate.tier === 1 ? 'Fits slot' : 'Partial fill'}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  Remaining {candidate.remainingHours.toFixed(2)}h / Est {candidate.estimateHoursCurrent.toFixed(2)}h · Rep {candidate.salesRepCode}
                </p>

                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  {candidate.winterFlag ? <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700">Winter</span> : null}
                  {candidate.frozenGroundFlag ? <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">Frozen Ground</span> : null}
                  {candidate.activeBlockers.map((blocker) => (
                    <span key={blocker.id} className="rounded bg-red-100 px-2 py-0.5 text-red-700">
                      {blocker.reason}
                    </span>
                  ))}
                  {candidate.requirements.map((requirement) => (
                    <span key={requirement.id} className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-700">
                      {requirement.requirementType} ({requirement.status})
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm text-slate-700" htmlFor={`alloc-${candidate.jobId}`}>
                    Allocated hours
                  </label>
                  <input
                    id={`alloc-${candidate.jobId}`}
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={allocations[candidate.jobId] ?? candidate.allocatedHours}
                    onChange={(event) =>
                      setAllocations((prev) => ({
                        ...prev,
                        [candidate.jobId]: Number(event.target.value),
                      }))
                    }
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    disabled={applied}
                  />
                  <button
                    type="button"
                    onClick={() => onApply(candidate)}
                    disabled={applied || busyJobId === candidate.jobId}
                    className="rounded bg-brand-green px-3 py-1.5 text-sm text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applied ? 'Scheduled' : busyJobId === candidate.jobId ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                {resultByJob[candidate.jobId] ? (
                  <p className={`mt-2 text-sm ${applied ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {resultByJob[candidate.jobId]}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={dismissing}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          >
            {dismissing ? 'Dismissing...' : 'Dismiss suggestions'}
          </button>
        </div>
      </div>
    </div>
  );
}
