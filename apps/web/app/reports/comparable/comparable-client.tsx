'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getComparableReport, type ComparableReportResponse } from '../../../lib/api';
import { getErrorMessage } from '../../../lib/error-utils';

type EquipmentKey = 'crane' | 'bucket';

const CHART_COLORS = ['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0d9488'];

type ChartRow = {
  week: number;
  snapshotDate: string | null;
  [yearKey: string]: number | string | null;
};

function formatSnapshotDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return value;
  }
  return `${month}/${day}`;
}

function buildChartRows(
  data: ComparableReportResponse,
  equipment: EquipmentKey,
  selectedYears: number[],
): ChartRow[] {
  const source = data[equipment];
  const rows: ChartRow[] = [];
  for (let week = 1; week <= 53; week += 1) {
    const entry: ChartRow = { week, snapshotDate: null };
    for (const year of selectedYears) {
      const point = source[year]?.[week] ?? null;
      entry[String(year)] = point?.total_hours ?? null;
      if (entry.snapshotDate === null && point?.snapshot_date) {
        entry.snapshotDate = point.snapshot_date;
      }
    }
    rows.push(entry);
  }
  return rows;
}

function EquipmentSection({
  title,
  equipment,
  report,
  selectedYears,
  currentYear,
}: {
  title: string;
  equipment: EquipmentKey;
  report: ComparableReportResponse;
  selectedYears: number[];
  currentYear: number;
}) {
  const [tableOpen, setTableOpen] = useState(false);
  const chartRows = useMemo(() => buildChartRows(report, equipment, selectedYears), [report, equipment, selectedYears]);
  const source = report[equipment];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value ?? '—')}
              labelFormatter={(label) => {
                const row = chartRows.find((item) => item.week === Number(label));
                return `Week ${label}${row?.snapshotDate ? ` (${formatSnapshotDate(row.snapshotDate)})` : ''}`;
              }}
            />
            <Legend />
            {selectedYears.map((year, index) => (
              <Line
                key={`${equipment}-${year}`}
                type="monotone"
                dataKey={String(year)}
                connectNulls={false}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={year === currentYear ? 3 : 2}
                dot={false}
                name={String(year)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        type="button"
        className="mt-4 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
        onClick={() => setTableOpen((open) => !open)}
      >
        {tableOpen ? 'Hide Table' : 'Show Table'}
      </button>

      {tableOpen ? (
        <div className="mt-3 space-y-4 overflow-x-auto">
          {selectedYears.map((year) => {
            const weeks = source[year] ?? {};
            const sortedWeeks = Object.keys(weeks)
              .map((week) => Number(week))
              .sort((a, b) => a - b);

            return (
              <div key={`${equipment}-table-${year}`} className="rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                  {year}
                </div>
                <table className="min-w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left">Metric</th>
                      {sortedWeeks.map((week) => (
                        <th key={`${year}-week-${week}`} className="px-2 py-2 text-right">
                          {formatSnapshotDate(weeks[week]?.snapshot_date ?? null)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['On Board', 'scheduled_hours'],
                      ['TBS', 'tbs_hours'],
                      ['Total', 'total_hours'],
                      ['Crews', 'crew_count'],
                      ['Crew-Days', 'crew_days'],
                    ].map(([label, key]) => (
                      <tr key={`${year}-${label}`} className="border-t border-slate-100">
                        <td className="px-2 py-2 font-medium text-slate-700">{label}</td>
                        {sortedWeeks.map((week) => {
                          const point = weeks[week];
                          const value = point ? point[key as keyof typeof point] : null;
                          return (
                            <td key={`${year}-${label}-${week}`} className="px-2 py-2 text-right">
                              {typeof value === 'number' ? value.toFixed(1) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default function ComparableClient() {
  const [report, setReport] = useState<ComparableReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await getComparableReport();
      setReport(data);
      setSelectedYears(data.available_years);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-80 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-72 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-slate-900">Backlog Comparable Report</h1>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error ?? 'Failed to load comparable report.'}</p>
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Backlog Comparable Report</h1>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700">Years</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {report.available_years.map((year) => {
            const checked = selectedYears.includes(year);
            return (
              <label
                key={year}
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                  checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedYears((current) => {
                      if (event.target.checked) {
                        return [...current, year].sort((a, b) => b - a);
                      }
                      return current.filter((value) => value !== year);
                    });
                  }}
                />
                {year}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <EquipmentSection
          title="Crane"
          equipment="crane"
          report={report}
          selectedYears={selectedYears}
          currentYear={currentYear}
        />
        <EquipmentSection
          title="Bucket"
          equipment="bucket"
          report={report}
          selectedYears={selectedYears}
          currentYear={currentYear}
        />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Hour figures available from 2019. Dollar figures available from app go-live date onward.
      </p>
    </main>
  );
}
