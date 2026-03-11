'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ApiRequestError, getJob, getJobRepCodes, updateJob } from '../../lib/api';
import NotesReview from './[jobId]/notes-review';

type EditJobModalProps = {
  open: boolean;
  jobId: string | null;
  salesRepCodes: string[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const ADD_NEW_REP_VALUE = '__ADD_NEW_REP__';

type FormState = {
  customerName: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  estimateHoursCurrent: string;
  amountDollars: string;
  salesRepCode: string;
  notesRaw: string;
};

const EMPTY_FORM: FormState = {
  customerName: '',
  town: '',
  equipmentType: 'CRANE',
  estimateHoursCurrent: '',
  amountDollars: '',
  salesRepCode: '',
  notesRaw: '',
};

export default function EditJobModal(props: EditJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [customRepInput, setCustomRepInput] = useState(false);
  const [fetchedRepCodes, setFetchedRepCodes] = useState<string[]>([]);

  useEffect(() => {
    const currentJobId = props.jobId;
    if (!props.open || currentJobId === null) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([getJob(currentJobId), getJobRepCodes().catch(() => [] as string[])])
      .then(([job, repCodes]) => {
        if (cancelled) {
          return;
        }
        setForm({
          customerName: job.customerName ?? '',
          town: job.town ?? '',
          equipmentType: job.equipmentType ?? 'CRANE',
          estimateHoursCurrent: job.estimateHoursCurrent ?? '',
          amountDollars: job.amountDollars ?? '',
          salesRepCode: job.salesRepCode ?? '',
          notesRaw: job.notesRaw ?? '',
        });
        setFetchedRepCodes(repCodes);
        setCustomRepInput(false);
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
              : 'Failed to load job.';
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
  }, [props.jobId, props.open]);

  const allRepCodes = useMemo(() => {
    const merged = new Set([...fetchedRepCodes, ...props.salesRepCodes]);
    // Ensure the job's current rep code is always selectable
    if (form.salesRepCode.trim()) {
      merged.add(form.salesRepCode.trim());
    }
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [fetchedRepCodes, props.salesRepCodes, form.salesRepCode]);

  const repSelectValue = useMemo(
    () => (form.salesRepCode && allRepCodes.includes(form.salesRepCode) ? form.salesRepCode : ''),
    [form.salesRepCode, allRepCodes],
  );

  if (!props.open || props.jobId === null) {
    return null;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentJobId = props.jobId;
    if (currentJobId === null) {
      return;
    }
    setError(null);
    const estimate = Number(form.estimateHoursCurrent);
    const amount = Number(form.amountDollars);

    if (
      !form.customerName.trim() ||
      !form.town.trim() ||
      !form.salesRepCode.trim() ||
      Number.isNaN(estimate) ||
      Number.isNaN(amount)
    ) {
      setError('Please complete all required fields.');
      return;
    }

    setSaving(true);
    try {
      await updateJob(currentJobId, {
        customerName: form.customerName.trim(),
        town: form.town.trim(),
        equipmentType: form.equipmentType,
        estimateHoursCurrent: estimate,
        amountDollars: amount,
        salesRepCode: form.salesRepCode.trim(),
        notesRaw: form.notesRaw,
      });
      await props.onSaved();
      props.onClose();
    } catch (requestError) {
      const message =
        requestError instanceof ApiRequestError
          ? requestError.message
          : requestError instanceof Error
            ? requestError.message
            : 'Failed to save job.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white shadow-xl">
      <form onSubmit={handleSave} className="flex h-full flex-col">
        <header className="border-b border-slate-200 p-4">
          <p className="text-sm text-slate-500">Edit Job</p>
          <h2 className="text-lg font-semibold text-slate-900">Update job details</h2>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}

          <label className="block text-sm font-medium text-slate-700">
            Customer name
            <input
              required
              type="text"
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Town
            <input
              required
              type="text"
              value={form.town}
              onChange={(event) => setForm((current) => ({ ...current, town: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Equipment type
            <select
              required
              value={form.equipmentType}
              onChange={(event) =>
                setForm((current) => ({ ...current, equipmentType: event.target.value as 'CRANE' | 'BUCKET' }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="CRANE">CRANE</option>
              <option value="BUCKET">BUCKET</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Estimated hours
            <input
              required
              type="number"
              min={0}
              step={0.1}
              value={form.estimateHoursCurrent}
              onChange={(event) => setForm((current) => ({ ...current, estimateHoursCurrent: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Dollar amount
            <input
              required
              type="number"
              min={0}
              step={0.01}
              value={form.amountDollars}
              onChange={(event) => setForm((current) => ({ ...current, amountDollars: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Sales rep code
            {customRepInput ? (
              <div className="space-y-2">
                <input
                  required
                  type="text"
                  value={form.salesRepCode}
                  onChange={(event) => setForm((current) => ({ ...current, salesRepCode: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="text-xs text-slate-600 underline"
                  onClick={() => {
                    setCustomRepInput(false);
                    setForm((current) => ({ ...current, salesRepCode: '' }));
                  }}
                >
                  Choose existing rep instead
                </button>
              </div>
            ) : (
              <select
                required
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={repSelectValue}
                onChange={(event) => {
                  if (event.target.value === ADD_NEW_REP_VALUE) {
                    setCustomRepInput(true);
                    setForm((current) => ({ ...current, salesRepCode: '' }));
                    return;
                  }
                  setForm((current) => ({ ...current, salesRepCode: event.target.value }));
                }}
              >
                <option value="">Select rep...</option>
                {allRepCodes.map((repCode) => (
                  <option key={repCode} value={repCode}>
                    {repCode}
                  </option>
                ))}
                <option value={ADD_NEW_REP_VALUE}>Add new...</option>
              </select>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Notes
            <textarea
              rows={4}
              value={form.notesRaw}
              onChange={(event) => setForm((current) => ({ ...current, notesRaw: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <NotesReview jobId={props.jobId} />

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
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
            disabled={saving || loading}
            className="rounded-md bg-brand-green px-3 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </aside>
  );
}
