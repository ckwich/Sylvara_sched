'use client';

import { useState, useMemo } from 'react';
import type { ResourceRecord, HomeBaseRecord } from '../../lib/api';
import type { ForemanDayData } from './use-dispatch-data';

type PrintDialogProps = {
  open: boolean;
  selectedDate: string;
  foremen: ResourceRecord[];
  homeBases: HomeBaseRecord[];
  dataByForeman: Record<string, ForemanDayData>;
  onClose: () => void;
};

export default function PrintDialog({
  open,
  selectedDate,
  foremen,
  homeBases,
  dataByForeman,
  onClose,
}: PrintDialogProps) {
  // Only include foremen who have schedule segments or travel segments for the day
  const activeForemen = useMemo(() => {
    return foremen.filter((f) => {
      const data = dataByForeman[f.id];
      if (!data) return false;
      return data.schedule.length > 0 || data.travel.length > 0;
    });
  }, [foremen, dataByForeman]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(activeForemen.map((f) => f.id)));

  // Sync selection when activeForemen changes
  const allActiveIds = useMemo(() => new Set(activeForemen.map((f) => f.id)), [activeForemen]);

  function toggleForeman(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(allActiveIds));
  }

  function selectNone() {
    setSelected(new Set());
  }

  function handlePrint() {
    const ids = Array.from(selected).join(',');
    const url = `/dispatch/print?date=${encodeURIComponent(selectedDate)}&foremen=${encodeURIComponent(ids)}`;
    window.open(url, '_blank');
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Print Schedule</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select foremen to include in the printout for{' '}
            <span className="font-medium text-slate-700">{formatDateLabel(selectedDate)}</span>.
          </p>
        </div>

        <div className="max-h-72 overflow-y-auto px-5 py-3">
          {activeForemen.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No foremen have scheduled segments for this day.
            </p>
          ) : (
            <>
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-medium text-brand-green hover:underline"
                >
                  Select all
                </button>
                <span className="text-xs text-slate-300">|</span>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-xs font-medium text-slate-500 hover:underline"
                >
                  Select none
                </button>
              </div>
              <div className="space-y-1">
                {activeForemen.map((f) => {
                  const data = dataByForeman[f.id];
                  const homeBase = data?.roster?.homeBaseId
                    ? homeBases.find((hb) => hb.id === data.roster?.homeBaseId)
                    : null;
                  const segCount = data?.schedule.length ?? 0;

                  return (
                    <label
                      key={f.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        selected.has(f.id) ? 'bg-brand-green/10' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(f.id)}
                        onChange={() => toggleForeman(f.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{f.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {homeBase ? homeBase.name : 'No home base'} &middot; {segCount} job{segCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={selected.size === 0}
            className="rounded-md bg-brand-green px-3 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            Open Print Preview ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
