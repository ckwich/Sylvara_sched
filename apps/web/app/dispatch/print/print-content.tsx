'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import {
  getForemen,
  getForemenSchedules,
  getForemanRosterMembers,
  getHomeBases,
  getJobs,
  getJobNotesReview,
  getOrgSettings,
  type DispatchScheduleSegment,
  type DispatchTravelSegment,
  type HomeBaseRecord,
  type JobSummary,
  type NotesReviewRequirement,
  type ResourceRecord,
} from '../../../lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimelineEntry =
  | { kind: 'job'; segment: DispatchScheduleSegment; job: JobSummary | null; requirements: NotesReviewRequirement[] }
  | { kind: 'travel'; segment: DispatchTravelSegment };

type ForemanPrintData = {
  foreman: ResourceRecord;
  homeBase: HomeBaseRecord | null;
  crew: Array<{ resourceName: string; role: string }>;
  timeline: TimelineEntry[];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateHeading(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function formatTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(iso));
}

function formatTimeRange(startIso: string, endIso: string, timezone: string): string {
  return `${formatTime(startIso, timezone)} – ${formatTime(endIso, timezone)}`;
}

function durationHours(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const hours = ms / (1000 * 60 * 60);
  return hours.toFixed(1);
}

function travelLabel(travelType: string): string {
  switch (travelType) {
    case 'START_OF_DAY':
      return 'Travel to first job';
    case 'END_OF_DAY':
      return 'Travel home';
    case 'BETWEEN_JOBS':
      return 'Travel between jobs';
    default:
      return 'Travel';
  }
}

function roleLabel(role: string): string {
  switch (role) {
    case 'CLIMBER':
      return 'Climber';
    case 'GROUND':
      return 'Ground';
    case 'OPERATOR':
      return 'Operator';
    case 'OTHER':
      return 'Other';
    default:
      return role;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PrintScheduleContent() {
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date') ?? '';
  const foremanIdsParam = searchParams.get('foremen') ?? '';
  const foremanIds = useMemo(
    () => foremanIdsParam.split(',').filter((id) => id.length > 0),
    [foremanIdsParam],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<ForemanPrintData[]>([]);
  const [companyTimezone, setCompanyTimezone] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    if (!selectedDate || foremanIds.length === 0) {
      setLoading(false);
      setError('Missing date or foreman selection.');
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all base data in parallel
        const [settings, foremenResp, homeBaseResp, jobsResp] = await Promise.all([
          getOrgSettings(),
          getForemen(),
          getHomeBases(),
          getJobs(),
        ]);

        if (cancelled) return;

        const tz = settings.companyTimezone;
        setCompanyTimezone(tz);

        const allForemen = foremenResp.foremen;
        const allHomeBases = homeBaseResp.homeBases;
        const jobsById = new Map(jobsResp.data.map((j) => [j.id, j]));

        // Fetch schedules and crew for selected foremen
        type CrewMember = { id: string; personResourceId: string; role: string; resourceName: string };
        const [schedulesResp, crewResults] = await Promise.all([
          getForemenSchedules(selectedDate, foremanIds),
          Promise.all(
            foremanIds.map(async (fid): Promise<[string, CrewMember[]]> => {
              try {
                const resp = await getForemanRosterMembers(fid, selectedDate);
                return [fid, resp.members];
              } catch {
                return [fid, []];
              }
            }),
          ),
        ]);

        if (cancelled) return;

        const crewMap = new Map(crewResults);

        // Collect all unique job IDs that have schedule segments
        const allJobIds = new Set<string>();
        for (const fid of foremanIds) {
          const schedule = schedulesResp.schedules[fid];
          if (schedule) {
            for (const seg of schedule.scheduleSegments) {
              allJobIds.add(seg.jobId);
            }
          }
        }

        // Fetch requirements for all scheduled jobs in parallel
        const requirementsByJobId = new Map<string, NotesReviewRequirement[]>();
        const reqResults = await Promise.all(
          Array.from(allJobIds).map(async (jobId): Promise<[string, NotesReviewRequirement[]]> => {
            try {
              const review = await getJobNotesReview(jobId);
              return [jobId, review.requirements];
            } catch {
              return [jobId, []];
            }
          }),
        );
        for (const [jobId, reqs] of reqResults) {
          requirementsByJobId.set(jobId, reqs);
        }

        if (cancelled) return;

        // Build print data for each foreman
        const data: ForemanPrintData[] = [];
        for (const fid of foremanIds) {
          const foreman = allForemen.find((f) => f.id === fid);
          if (!foreman) continue;

          const schedule = schedulesResp.schedules[fid];
          const roster = schedule?.roster ?? null;
          const homeBase = roster?.homeBaseId
            ? allHomeBases.find((hb) => hb.id === roster.homeBaseId) ?? null
            : null;

          const crew = crewMap.get(fid) ?? [];

          // Build chronological timeline: merge schedule segments and travel segments
          const entries: TimelineEntry[] = [];

          for (const seg of schedule?.scheduleSegments ?? []) {
            entries.push({
              kind: 'job',
              segment: seg,
              job: jobsById.get(seg.jobId) ?? null,
              requirements: requirementsByJobId.get(seg.jobId) ?? [],
            });
          }

          for (const trav of schedule?.travelSegments ?? []) {
            entries.push({ kind: 'travel', segment: trav });
          }

          // Sort by start time
          entries.sort((a, b) => {
            const aStart = a.kind === 'job' ? a.segment.startDatetime : a.segment.startDatetime;
            const bStart = b.kind === 'job' ? b.segment.startDatetime : b.segment.startDatetime;
            return new Date(aStart).getTime() - new Date(bStart).getTime();
          });

          data.push({ foreman, homeBase, crew, timeline: entries });
        }

        setPrintData(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load schedule data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, foremanIds]);

  // Auto-open print dialog once data is loaded
  useEffect(() => {
    if (!loading && !error && printData.length > 0) {
      // Small delay so the browser finishes rendering before the print dialog opens
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, error, printData]);

  if (loading) {
    return (
      <main className="print-page p-8">
        <p className="text-sm text-slate-500">Loading schedule data…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="print-page p-8">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (printData.length === 0) {
    return (
      <main className="print-page p-8">
        <p className="text-sm text-slate-500">No schedule data found for the selected foremen.</p>
      </main>
    );
  }

  return (
    <main className="print-page mx-auto max-w-4xl p-6 print:max-w-none print:p-0">
      {/* Screen-only controls */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Print Preview</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Close
          </button>
        </div>
      </div>

      {printData.map((fd, idx) => (
        <section
          key={fd.foreman.id}
          className={`print-foreman-section ${idx > 0 ? 'mt-10 border-t-2 border-slate-300 pt-6 print:mt-0 print:border-t-0 print:pt-0' : ''}`}
        >
          {/* Header */}
          <div className="mb-4 border-b-2 border-black pb-2 print:border-b print:border-black">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold print:text-base">Iron Tree Service</h2>
              <p className="text-sm font-medium print:text-xs">{formatDateHeading(selectedDate)}</p>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <h3 className="text-base font-semibold print:text-sm">{fd.foreman.name}</h3>
              {fd.homeBase ? (
                <p className="text-xs text-slate-600 print:text-[10px]">
                  Home base: {fd.homeBase.name}
                  {fd.homeBase.addressLine1 ? ` — ${fd.homeBase.addressLine1}` : ''}
                  {fd.homeBase.city ? `, ${fd.homeBase.city}` : ''}
                </p>
              ) : null}
            </div>
          </div>

          {/* Crew */}
          {fd.crew.length > 0 ? (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase text-slate-500 print:text-[10px]">Crew</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                {fd.crew.map((m) => (
                  <span key={m.resourceName} className="text-sm print:text-xs">
                    {m.resourceName}{' '}
                    <span className="text-xs text-slate-500 print:text-[10px]">({roleLabel(m.role)})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Timeline */}
          {fd.timeline.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No scheduled segments.</p>
          ) : (
            <table className="w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="border-b border-slate-400 text-left text-xs font-semibold uppercase text-slate-600 print:text-[10px]">
                  <th className="w-32 py-1 pr-2">Time</th>
                  <th className="py-1 pr-2">Details</th>
                  <th className="w-20 py-1 pr-2 text-right">Hours</th>
                  <th className="w-24 py-1 text-right">Equipment</th>
                </tr>
              </thead>
              <tbody>
                {fd.timeline.map((entry) => {
                  if (entry.kind === 'travel') {
                    return (
                      <tr
                        key={`travel-${entry.segment.id}`}
                        className="border-b border-slate-200 bg-slate-50 print:bg-transparent"
                      >
                        <td className="py-1.5 pr-2 align-top font-mono text-xs print:text-[10px]">
                          {formatTimeRange(entry.segment.startDatetime, entry.segment.endDatetime, companyTimezone)}
                        </td>
                        <td className="py-1.5 pr-2 italic text-slate-500" colSpan={3}>
                          {travelLabel(entry.segment.travelType)}
                          {entry.segment.notes ? ` — ${entry.segment.notes}` : ''}
                        </td>
                      </tr>
                    );
                  }

                  // Job entry
                  const { segment, job, requirements } = entry;
                  const unmetReqs = requirements.filter((r) => r.status !== 'MET' && r.status !== 'NOT_APPLICABLE');

                  return (
                    <tr
                      key={`job-${segment.id}`}
                      className="border-b border-slate-200"
                    >
                      <td className="py-1.5 pr-2 align-top font-mono text-xs print:text-[10px]">
                        {formatTimeRange(segment.startDatetime, segment.endDatetime, companyTimezone)}
                      </td>
                      <td className="py-1.5 pr-2 align-top">
                        <div>
                          <span className="font-semibold">{job?.customerName ?? 'Unknown'}</span>
                          {job?.town ? (
                            <span className="ml-2 text-xs text-slate-500 print:text-[10px]">{job.town}</span>
                          ) : null}
                        </div>
                        {job?.jobSiteAddress ? (
                          <p className="text-xs text-slate-600 print:text-[10px]">{job.jobSiteAddress}</p>
                        ) : null}
                        {segment.notes ? (
                          <p className="mt-0.5 text-xs text-slate-500 print:text-[10px]">
                            Note: {segment.notes}
                          </p>
                        ) : null}
                        {unmetReqs.length > 0 ? (
                          <div className="mt-0.5">
                            {unmetReqs.map((req) => (
                              <p
                                key={req.id}
                                className="text-xs text-amber-700 print:text-[10px] print:text-black"
                              >
                                ⚠ {req.requirementTypeLabel}: {req.status.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-1.5 pr-2 align-top text-right font-mono">
                        {segment.scheduledHoursOverride
                          ? Number(segment.scheduledHoursOverride).toFixed(1)
                          : durationHours(segment.startDatetime, segment.endDatetime)}
                      </td>
                      <td className="py-1.5 align-top text-right">
                        {job?.equipmentType ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </main>
  );
}
