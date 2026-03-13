'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getSummReport,
  patchOrgSettingsSalesPerDay,
  type SummReportResponse,
} from '../../../lib/api';
import { getErrorMessage } from '../../../lib/error-utils';

type SummClientProps = {
  canEditSalesPerDay: boolean;
};

function formatCurrency(value: number | null): string {
  if (value === null) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDays(value: number | null): string {
  return value === null ? '—' : value.toFixed(2);
}

export default function SummClient({ canEditSalesPerDay }: SummClientProps) {
  const [report, setReport] = useState<SummReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [salesPerDayInput, setSalesPerDayInput] = useState('');

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSummReport();
      setReport(data);
      setSalesPerDayInput(data.sales_per_day === null ? '' : String(data.sales_per_day));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const rows = useMemo(() => report?.rows ?? [], [report]);

  async function handleSaveSalesPerDay() {
    setSaveMessage(null);
    setError(null);
    const trimmed = salesPerDayInput.trim();
    const value = trimmed.length === 0 ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value <= 0)) {
      setError('Sales per day must be a positive number or blank.');
      return;
    }

    setSaving(true);
    try {
      const updated = await patchOrgSettingsSalesPerDay(value);
      setSalesPerDayInput(updated.sales_per_day === null ? '' : String(updated.sales_per_day));
      setSaveMessage('Saved ✓');
      await loadReport();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-72 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  if (error && !report) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Backlog in Dollars</h1>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadReport()}
            className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-red-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Backlog in Dollars</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Backlog in Dollars</h1>
      <p className="mt-1 text-sm text-slate-500">Report date: {report.report_date}</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">Rep</th>
              <th className="px-3 py-2.5 text-right font-semibold">Bucket Sched</th>
              <th className="px-3 py-2.5 text-right font-semibold">Bucket TBS</th>
              <th className="px-3 py-2.5 text-right font-semibold">Bucket Total</th>
              <th className="px-3 py-2.5 text-right font-semibold">Crane Sched</th>
              <th className="px-3 py-2.5 text-right font-semibold">Crane TBS</th>
              <th className="px-3 py-2.5 text-right font-semibold">Crane Total</th>
              <th className="px-3 py-2.5 text-right font-semibold">Total Sched</th>
              <th className="px-3 py-2.5 text-right font-semibold">Total TBS</th>
              <th className="px-3 py-2.5 text-right font-semibold">Grand Total</th>
              <th className="px-3 py-2.5 text-right font-semibold">% of Total</th>
              <th className="px-3 py-2.5 text-right font-semibold">Prior Week</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sales_rep_code} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{row.sales_rep_code}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.bucket_scheduled_dollars)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.bucket_tbs_dollars)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.bucket_total_dollars)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.crane_scheduled_dollars)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.crane_tbs_dollars)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(row.crane_total_dollars)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.combined_scheduled_dollars)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.combined_tbs_dollars)}</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {formatCurrency(row.combined_total_dollars)}
                </td>
                <td className="px-3 py-2 text-right">{formatPercent(row.pct_of_total)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.prior_week_dollars)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
            <tr>
              <td className="px-3 py-2">Totals</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.bucket_scheduled_dollars)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.bucket_tbs_dollars)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.bucket_total_dollars)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.crane_scheduled_dollars)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.crane_tbs_dollars)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.crane_total_dollars)}</td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.combined_scheduled_dollars)}
              </td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.combined_tbs_dollars)}</td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.combined_total_dollars)}
              </td>
              <td className="px-3 py-2 text-right">100.0%</td>
              <td className="px-3 py-2 text-right">{formatCurrency(report.totals.prior_week_dollars)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Backlog Days</h2>
        <p className="mt-2 text-sm text-slate-600">
          Estimate of Sales Per Day:{' '}
          <span className="font-medium">
            {report.sales_per_day === null ? 'Not set' : formatCurrency(report.sales_per_day)}
          </span>
        </p>
        {canEditSalesPerDay ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={salesPerDayInput}
              onChange={(event) => setSalesPerDayInput(event.target.value)}
              className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Sales per day"
            />
            <button
              type="button"
              onClick={() => void handleSaveSalesPerDay()}
              disabled={saving}
              className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saveMessage ? <span className="text-sm text-green-700">{saveMessage}</span> : null}
          </div>
        ) : null}

        {error ? <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <p>
            Days Sales in Backlog (this week):{' '}
            {report.days_sales_in_backlog === null ? 'Set sales/day to enable' : formatDays(report.days_sales_in_backlog)}
          </p>
          <p>Days Sales in Backlog (prior week): {formatDays(report.prior_week_days_sales)}</p>
          <p>
            Change:{' '}
            {report.days_sales_change === null
              ? '—'
              : `${report.days_sales_change >= 0 ? '+' : ''}${report.days_sales_change.toFixed(2)}`}
          </p>
        </div>
      </section>
    </main>
  );
}
