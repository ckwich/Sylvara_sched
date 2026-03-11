'use client';

import { useEffect, useMemo, useState } from 'react';
import { scheduleEventLabel } from '@sylvara/shared';
import {
  deleteJobRequirement,
  deleteJobScheduleEvent,
  getJobNotesReview,
  markJobNotesReviewed,
  updateJob,
  updateJobRequirementStatus,
  type NotesReviewData,
  type NotesReviewRequirement,
} from '../../../lib/api';
import { getErrorMessage } from '../../../lib/error-utils';

const REQUIREMENT_STATUSES = [
  'REQUIRED',
  'REQUESTED',
  'APPROVED',
  'DENIED',
  'NOT_REQUIRED',
] as const;

const FLAG_LABELS: Record<string, string> = {
  winterFlag: 'Winter',
  frozenGroundFlag: 'Frozen Ground',
  requiresSpiderLift: 'Spider Lift',
  hasClimb: 'Climb',
  pushUpIfPossible: 'Push Up',
};

type NotesReviewProps = {
  jobId: string;
};

export default function NotesReview(props: NotesReviewProps) {
  const [data, setData] = useState<NotesReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await getJobNotesReview(props.jobId);
      setData(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [props.jobId]);

  const hasLegacyItems = useMemo(
    () => (data?.requirements.length ?? 0) + (data?.scheduleEvents.length ?? 0) > 0,
    [data],
  );

  async function handleConfirmReview() {
    setSaving(true);
    setError(null);
    try {
      await markJobNotesReviewed(props.jobId);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleRequirementStatus(requirement: NotesReviewRequirement, status: string) {
    setError(null);
    try {
      const updated = await updateJobRequirementStatus(props.jobId, requirement.id, status);
      setData((current) =>
        current
          ? {
              ...current,
              requirements: current.requirements.map((item) => (item.id === requirement.id ? updated : item)),
            }
          : current,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleFlagToggle(
    key: 'winterFlag' | 'frozenGroundFlag' | 'requiresSpiderLift' | 'hasClimb' | 'pushUpIfPossible',
    value: boolean,
  ) {
    setError(null);
    try {
      await updateJob(props.jobId, { [key]: value });
      setData((current) => (current ? { ...current, job: { ...current.job, [key]: value } } : current));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleDeleteRequirement(requirementId: string) {
    setError(null);
    try {
      await deleteJobRequirement(props.jobId, requirementId);
      setData((current) =>
        current ? { ...current, requirements: current.requirements.filter((item) => item.id !== requirementId) } : current,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleDeleteScheduleEvent(eventId: string) {
    setError(null);
    try {
      await deleteJobScheduleEvent(props.jobId, eventId);
      setData((current) =>
        current ? { ...current, scheduleEvents: current.scheduleEvents.filter((item) => item.id !== eventId) } : current,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">Loading notes review...</div>;
  }

  if (!data) {
    return <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Unable to load notes review.</div>;
  }

  return (
    <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Extracted from Notes</h3>
        <button
          type="button"
          onClick={() => void handleConfirmReview()}
          disabled={saving}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Confirm Review'}
        </button>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Raw Notes</p>
        <textarea
          readOnly
          value={data.job.notesRaw ?? ''}
          rows={4}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Schedule Events</p>
        <div className="space-y-2">
          {data.scheduleEvents.length === 0 ? <p className="text-xs text-slate-500">No extracted schedule events.</p> : null}
          {data.scheduleEvents.map((event) => (
            <div key={event.id} className="rounded-md border border-slate-200 p-2 text-xs text-slate-700">
              <p className="font-medium">{scheduleEventLabel(event.eventType)}</p>
              <p>From: {event.fromAt ?? '—'} | To: {event.toAt ?? '—'}</p>
              <p>Snippet: {event.rawSnippet ?? '—'}</p>
              <p>Actor: {event.actorCode ?? '—'}</p>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleConfirmReview()}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteScheduleEvent(event.id)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Requirements</p>
        <div className="space-y-2">
          {data.requirements.length === 0 ? <p className="text-xs text-slate-500">No extracted requirements.</p> : null}
          {data.requirements.map((requirement) => (
            <div key={requirement.id} className="rounded-md border border-slate-200 p-2 text-xs text-slate-700">
              <p className="font-medium">
                {requirement.requirementTypeLabel} ({requirement.requirementType})
              </p>
              <p>Snippet: {requirement.rawSnippet ?? '—'}</p>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={requirement.status}
                  onChange={(event) => void handleRequirementStatus(requirement, event.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  {REQUIREMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleDeleteRequirement(requirement.id)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Flags</p>
        <div className="grid gap-1 text-xs text-slate-700">
          {(
            [
              ['winterFlag', data.job.winterFlag],
              ['frozenGroundFlag', data.job.frozenGroundFlag],
              ['requiresSpiderLift', data.job.requiresSpiderLift],
              ['hasClimb', data.job.hasClimb],
              ['pushUpIfPossible', data.job.pushUpIfPossible],
            ] as const
          ).map(([key, value]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(event) =>
                  void handleFlagToggle(
                    key,
                    event.target.checked,
                  )
                }
              />
              {FLAG_LABELS[key] ?? key}
            </label>
          ))}
        </div>
      </div>

      {!hasLegacyItems ? <p className="text-xs text-slate-500">No LEGACY_PARSE items found.</p> : null}
      {error ? <p className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p> : null}
    </section>
  );
}
