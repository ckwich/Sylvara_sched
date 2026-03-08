'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminImportSummary, type AdminImportSummary } from '../../../lib/api';
import { getErrorMessage } from '../../../lib/error-utils';

export default function ImportSummaryClient() {
  const [data, setData] = useState<AdminImportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getAdminImportSummary()
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(getErrorMessage(requestError));
        }
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

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Import Reconciliation</h1>
          <p className="text-sm text-slate-500">Read-only import and notes parsing summary.</p>
        </div>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to Admin
        </Link>
      </div>

      {loading ? <div className="h-24 animate-pulse rounded bg-slate-100" /> : null}
      {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {!loading && data ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Jobs Imported per Sheet</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {data.importSources.map((row) => (
                <li key={row.importSource ?? 'NULL'}>
                  {(row.importSource ?? 'UNKNOWN')} — {row.jobsCount}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
            <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
              <div>Segments: {data.totals.segmentsCreated}</div>
              <div>Schedule events: {data.totals.scheduleEventsCreated}</div>
              <div>Requirements: {data.totals.requirementsCreated}</div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Unable Jobs ({data.unable.count})</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {data.unable.jobs.map((job) => (
                <li key={job.id}>
                  {job.customerName} ({job.town}) - <Link href="/backlog" className="text-blue-700 underline">view</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Unresolved Linked Pairs ({data.unresolvedLinkedPairs.count})
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {data.unresolvedLinkedPairs.jobs.map((job) => (
                <li key={job.id}>
                  {job.customerName} — {job.jobSiteAddress}, {job.town} ({job.linkedEquipmentNote ?? 'N/A'})
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending Notes Review: {data.pendingNotesReview.count}
            </h2>
          </section>
        </>
      ) : null}
    </main>
  );
}
