'use client';

import { localDateMinuteToUtc } from '@sylvara/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createForemanRoster,
  createScheduleAttempt,
  createTravelSegment,
  removeScheduleSegment,
} from '../../lib/api';
import ForemanColumn from './foreman-column';
import {
  formatDateHeading,
  getErrorMessage,
  localMinuteFromIso,
  minuteToLabel,
  nextDate,
  PX_PER_MINUTE,
  START_SCROLL_MINUTE,
  WARNING_MESSAGES,
} from './dispatch-utils';
import JobSelectorPanel from './job-selector-panel';
import type { ScheduleBlockData } from './schedule-block';
import { useDispatchData } from './use-dispatch-data';

type DispatchCalendarProps = {
  initialDate: string;
};

export default function DispatchCalendar(props: DispatchCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actorUserId = process.env.NEXT_PUBLIC_DEV_ACTOR_USER_ID;
  const selectedDate = searchParams.get('date') ?? props.initialDate;
  const devtoolsEnabled =
    process.env.NODE_ENV !== 'production' && searchParams.get('devtools') === 'true';

  const {
    companyTimezone,
    foremen,
    homeBases,
    people,
    jobs,
    dataByForeman,
    loading,
    error,
    crewBusyForemanId,
    crewErrorByForeman,
    loadDispatchData,
    handleAddCrew,
  } = useDispatchData(selectedDate, actorUserId);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<{ foremanId: string; minute: number } | null>(null);
  const [panelSubmitting, setPanelSubmitting] = useState(false);
  const [panelRejection, setPanelRejection] = useState<string | null>(null);
  const [panelWarnings, setPanelWarnings] = useState<string[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.scrollTop = START_SCROLL_MINUTE * PX_PER_MINUTE;
  }, [loading]);

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const todayDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: companyTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    [companyTimezone],
  );

  const axisRows = useMemo(
    () =>
      Array.from({ length: 24 * 2 }).map((_, index) => {
        const minute = index * 30;
        const lineClass = minute % 60 === 0 ? 'border-slate-300' : 'border-slate-200';
        return (
          <div key={`axis-${minute}`} className={`h-[45px] border-t ${lineClass} pr-2 text-right text-xs text-slate-500`}>
            {minute >= START_SCROLL_MINUTE ? minuteToLabel(minute) : ''}
          </div>
        );
      }),
    [],
  );

  const columns = useMemo(
    () =>
      foremen.map((foreman) => {
        const dayData = dataByForeman[foreman.id] ?? { roster: null, schedule: [], travel: [], crew: [] };
        const scheduleBlocks: ScheduleBlockData[] = dayData.schedule.map((segment) => {
          const startMinute = localMinuteFromIso(segment.startDatetime, companyTimezone);
          const endMinute = localMinuteFromIso(segment.endDatetime, companyTimezone);
          const job = jobsById.get(segment.jobId);
          return {
            id: segment.id,
            title: job?.customerName ?? 'Unknown customer',
            subtitle: job?.town ?? 'Unknown town',
            state: job?.derivedState ?? 'TBS',
            startLabel: minuteToLabel(startMinute),
            endLabel: minuteToLabel(endMinute),
            scheduledHoursLabel: job?.scheduledEffectiveHours ?? '-',
            remainingHoursLabel: job?.remainingHours ?? '-',
            jobStateLabel: job?.derivedState ?? 'TBS',
            startSlot: Math.floor(startMinute / 10),
            endSlotExclusive: Math.max(Math.ceil(endMinute / 10), Math.floor(startMinute / 10) + 1),
          };
        });

        const travelBlocks: ScheduleBlockData[] = dayData.travel.map((segment) => {
          const startMinute = localMinuteFromIso(segment.startDatetime, companyTimezone);
          const endMinute = localMinuteFromIso(segment.endDatetime, companyTimezone);
          return {
            id: segment.id,
            title: 'Travel',
            subtitle: '',
            state: 'TRAVEL',
            startLabel: minuteToLabel(startMinute),
            endLabel: minuteToLabel(endMinute),
            scheduledHoursLabel: '-',
            remainingHoursLabel: '-',
            jobStateLabel: 'Travel',
            travelLabel: segment.travelType.replaceAll('_', ' '),
            startSlot: Math.floor(startMinute / 10),
            endSlotExclusive: Math.max(Math.ceil(endMinute / 10), Math.floor(startMinute / 10) + 1),
          };
        });

        return {
          foreman,
          dayData,
          blocks: [...scheduleBlocks, ...travelBlocks].sort((a, b) => a.startSlot - b.startSlot),
        };
      }),
    [companyTimezone, dataByForeman, foremen, jobsById],
  );


  async function handleSchedule(input: {
    jobId: string;
    durationMinutes: number;
    travelBeforeMinutes: number;
    travelAfterMinutes: number;
  }) {
    if (!selectedSlot) {
      return;
    }
    setPanelSubmitting(true);
    setPanelWarnings([]);
    setPanelRejection(null);

    try {
      const foremanId = selectedSlot.foremanId;
      const foremanDay = dataByForeman[foremanId];
      let roster = foremanDay?.roster ?? null;
      if (!roster) {
        const defaultHomeBase = homeBases.length === 1 ? homeBases[0] : homeBases[0] ?? null;
        if (!defaultHomeBase) {
          throw new Error('HOME_BASE_REQUIRED: No home base available for roster creation.');
        }
        roster = await createForemanRoster(
          foremanId,
          { date: selectedDate, homeBaseId: defaultHomeBase.id },
          actorUserId,
        );
      }

      const result = await createScheduleAttempt({
        jobId: input.jobId,
        foremanPersonId: foremanId,
        date: selectedDate,
        requestedStartMinute: selectedSlot.minute,
        durationMinutes: input.durationMinutes,
        companyTimezone,
        rosterId: roster.id,
        actorUserId,
      });

      if (result.result === 'REJECT') {
        const messageByCode: Record<string, string> = {
          OVERLAP_CONFLICT: 'This time overlaps an existing job.',
          SCHEDULE_CONFLICT: 'This time overlaps an existing job.',
          CROSSES_MIDNIGHT: 'Block would run past midnight.',
          ACTIVE_BLOCKER: 'This job has an active blocker.',
          NO_CONTIGUOUS_SLOT_AT_CLICK: `Not enough free time for ${Math.round(input.durationMinutes / 60)} hours here.`,
        };
        const code = result.error?.code ?? 'REQUEST_REJECTED';
        setPanelRejection(messageByCode[code] ?? result.error?.message ?? 'Scheduling request was rejected.');
        return;
      }

      await loadDispatchData(selectedDate);
      setSelectedSlot(null);

      if (result.segment && (input.travelBeforeMinutes > 0 || input.travelAfterMinutes > 0)) {
        const startMinute = selectedSlot.minute;
        const endMinute = selectedSlot.minute + input.durationMinutes;
        const warnings: string[] = [];

        if (input.travelBeforeMinutes > 0) {
          try {
            await createTravelSegment(
              {
                foremanPersonId: foremanId,
                travelType: 'BETWEEN_JOBS',
                startDatetime: localDateMinuteToUtc(
                  selectedDate,
                  Math.max(0, startMinute - input.travelBeforeMinutes),
                  companyTimezone,
                ).toISOString(),
                endDatetime: localDateMinuteToUtc(selectedDate, startMinute, companyTimezone).toISOString(),
                relatedJobId: input.jobId,
              },
              actorUserId,
            );
          } catch {
            warnings.push('Travel before block could not be created.');
          }
        }

        if (input.travelAfterMinutes > 0) {
          try {
            await createTravelSegment(
              {
                foremanPersonId: foremanId,
                travelType: 'BETWEEN_JOBS',
                startDatetime: localDateMinuteToUtc(selectedDate, endMinute, companyTimezone).toISOString(),
                endDatetime: localDateMinuteToUtc(
                  selectedDate,
                  Math.min(1440, endMinute + input.travelAfterMinutes),
                  companyTimezone,
                ).toISOString(),
                relatedJobId: input.jobId,
              },
              actorUserId,
            );
          } catch {
            warnings.push('Travel after block could not be created.');
          }
        }

        if (warnings.length > 0) {
          setPanelWarnings(warnings);
        }
      }

      setPanelWarnings((result.warnings ?? []).map((warning) => WARNING_MESSAGES[warning.code] ?? warning.message));
    } catch (scheduleError) {
      setPanelRejection(getErrorMessage(scheduleError));
    } finally {
      setPanelSubmitting(false);
    }
  }

  async function handleRemoveSegment(segmentId: string) {
    if (!window.confirm('Remove this segment?')) {
      return;
    }
    await removeScheduleSegment(segmentId, actorUserId);
    await loadDispatchData(selectedDate);
  }

  function setDate(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', date);
    router.push(`/dispatch?${params.toString()}`);
  }

  if (loading) {
    return (
      <main className="px-4 py-6">
        <div className="mx-auto max-w-[1600px] space-y-3">
          <div className="h-10 animate-pulse rounded bg-slate-200" />
          <div className="h-[560px] animate-pulse rounded bg-slate-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dispatch</h1>
            <p className="text-sm text-slate-500">{formatDateHeading(selectedDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDate(nextDate(selectedDate, -1))} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm">
              Prev
            </button>
            <button type="button" onClick={() => setDate(todayDate)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm">
              Today
            </button>
            <button type="button" onClick={() => setDate(nextDate(selectedDate, 1))} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm">
              Next
            </button>
            <button
              type="button"
              onClick={() => setDiagnosticsOpen((current) => !current)}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm"
              aria-label="Toggle diagnostics"
            >
              ?
            </button>
          </div>
        </div>

        {error ? <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {diagnosticsOpen ? (
          <section className="mb-3 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <p>Timezone: {companyTimezone}</p>
            <p>Foremen loaded: {foremen.length}</p>
            <p>Jobs loaded: {jobs.length}</p>
          </section>
        ) : null}

        {devtoolsEnabled ? (
          <section className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Dev tools enabled via <code>?devtools=true</code>.
          </section>
        ) : null}

        <section
          ref={scrollerRef}
          className="h-[calc(100vh-180px)] overflow-y-auto rounded-lg border border-slate-200 bg-white"
        >
          <div
            className="flex flex-row min-w-0"
            style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', height: '100%' }}
          >
            <aside
              className="sticky left-0 z-20 flex-none w-16 border-r border-slate-200 bg-white pt-[76px]"
              style={{
                position: 'sticky',
                left: 0,
                zIndex: 20,
                background: 'white',
                flexShrink: 0,
                width: '4rem',
              }}
            >
              {axisRows}
            </aside>
            <div
              className="flex flex-row flex-1 overflow-x-auto"
              style={{ display: 'flex', flexDirection: 'row', flex: 1, overflowX: 'auto' }}
            >
              {columns.map(({ foreman, blocks, dayData }) => (
                <ForemanColumn
                  key={foreman.id}
                  foremanId={foreman.id}
                  foremanName={foreman.name}
                  crew={dayData.crew.map((member) => ({
                    id: member.id,
                    name: member.resourceName,
                    role: member.role,
                  }))}
                  blocks={blocks}
                  peopleOptions={people.map((person) => ({ id: person.id, name: person.name }))}
                  homeBaseOptions={homeBases.map((homeBase) => ({ id: homeBase.id, name: homeBase.name }))}
                  requireHomeBaseChoice={dayData.roster === null && homeBases.length > 1}
                  addingCrew={crewBusyForemanId === foreman.id}
                  crewError={crewErrorByForeman[foreman.id] ?? null}
                  onAddCrew={(input) => handleAddCrew(foreman.id, input)}
                  onSelectMinute={(input) => setSelectedSlot(input)}
                  onRemoveSegment={handleRemoveSegment}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <JobSelectorPanel
        open={selectedSlot !== null}
        foremanName={foremen.find((foreman) => foreman.id === selectedSlot?.foremanId)?.name ?? ''}
        date={selectedDate}
        clickedTimeLabel={minuteToLabel(selectedSlot?.minute ?? 0)}
        jobs={jobs}
        onClose={() => setSelectedSlot(null)}
        onSchedule={handleSchedule}
        submitting={panelSubmitting}
        rejection={panelRejection}
        warnings={panelWarnings}
      />
    </main>
  );
}
