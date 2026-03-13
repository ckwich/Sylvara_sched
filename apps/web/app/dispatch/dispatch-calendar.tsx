'use client';

import { localDateMinuteToUtc, utcToLocalParts } from '@sylvara/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getOpenPushupSlots,
  getPushupCandidates,
  createForemanRoster,
  createScheduleAttempt,
  createTravelSegment,
  removeScheduleSegment,
} from '../../lib/api';
import CrewAddPanel from './crew-add-panel';
import ForemanColumn from './foreman-column';
import {
  DAY_START_MINUTE,
  formatDateHeading,
  getErrorMessage,
  minuteToLabel,
  nextDate,
  PX_PER_MINUTE,
  START_SCROLL_MINUTE,
  WARNING_MESSAGES,
} from './dispatch-utils';
import JobSelectorPanel from './job-selector-panel';
import type { ScheduleBlockData } from './schedule-block';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PrintDialog from './print-dialog';
import PushupModal from './pushup-modal';
import { useDispatchData } from './use-dispatch-data';

type DispatchCalendarProps = {
  initialDate: string;
};

export default function DispatchCalendar(props: DispatchCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    conflicts,
    dismissedConflictKeys,
    handleAddCrew,
    reloadForemanDay,
    reloadJobs,
    dismissDispatchConflict,
  } = useDispatchData(selectedDate);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [conflictsOpen, setConflictsOpen] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<{ foremanId: string; minute: number } | null>(null);
  const [panelSubmitting, setPanelSubmitting] = useState(false);
  const [panelRejection, setPanelRejection] = useState<string | null>(null);
  const [panelWarnings, setPanelWarnings] = useState<string[]>([]);
  const [inlineCreationWarnings, setInlineCreationWarnings] = useState<string[]>([]);
  const [dismissedInlineWarnings, setDismissedInlineWarnings] = useState<Set<string>>(new Set());
  const [openPushupSlotIds, setOpenPushupSlotIds] = useState<string[]>([]);
  const [activePushupSlotId, setActivePushupSlotId] = useState<string | null>(null);
  const [addCrewForemanId, setAddCrewForemanId] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ foremanId: string; segmentId: string } | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pushupOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.scrollTop = START_SCROLL_MINUTE * PX_PER_MINUTE;
  }, [loading]);

  useEffect(
    () => () => {
      if (pushupOpenTimerRef.current) {
        clearTimeout(pushupOpenTimerRef.current);
        pushupOpenTimerRef.current = null;
      }
    },
    [],
  );

  async function reloadOpenPushupSlots() {
    try {
      const slots = await getOpenPushupSlots();
      const visible = slots.filter((slot) => {
        const localDate = new Intl.DateTimeFormat('en-CA', {
          timeZone: companyTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(slot.startDatetime));
        return localDate === selectedDate;
      });

      // Only include slots that actually have matching candidates
      const withCandidates = await Promise.all(
        visible.map(async (slot) => {
          try {
            const response = await getPushupCandidates(slot.id);
            return response.candidates.length > 0 ? slot.id : null;
          } catch {
            return null;
          }
        }),
      );
      setOpenPushupSlotIds(withCandidates.filter((id): id is string => id !== null));
    } catch {
      setOpenPushupSlotIds([]);
    }
  }

  useEffect(() => {
    void reloadOpenPushupSlots();
  }, [selectedDate, companyTimezone]);

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const salesRepCodes = useMemo(
    () =>
      Array.from(
        new Set(
          jobs
            .map((job) => job.salesRepCode.trim())
            .filter((repCode) => repCode.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [jobs],
  );
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
        const minute = (DAY_START_MINUTE + index * 30) % 1440;
        const lineClass = minute % 60 === 0 ? 'border-slate-300' : 'border-slate-200';
        return (
          <div key={`axis-${minute}`} className={`relative h-[45px] border-t ${lineClass}`}>
            <span
              className="absolute inset-y-0 right-2 flex items-center text-right text-xs text-gray-500"
            >
              {minuteToLabel(minute)}
            </span>
          </div>
        );
      }),
    [],
  );

  const columns = useMemo(
    () =>
      foremen.map((foreman) => {
        const minuteOfDay = (iso: string) => {
          const local = utcToLocalParts(new Date(iso), companyTimezone);
          return local.hour * 60 + local.minute;
        };
        const toSlot = (minuteOfDayValue: number) => Math.floor((minuteOfDayValue - DAY_START_MINUTE) / 10);

        const dayData = dataByForeman[foreman.id] ?? { roster: null, schedule: [], travel: [], crew: [] };
        const scheduleBlocks = dayData.schedule
          .map((segment) => {
          const startMinuteOfDay = minuteOfDay(segment.startDatetime);
          const endMinuteOfDay = minuteOfDay(segment.endDatetime);
          const durationMinutes = endMinuteOfDay - startMinuteOfDay;
          if (durationMinutes <= 0) {
            return null;
          }
          const top = (startMinuteOfDay - DAY_START_MINUTE) * PX_PER_MINUTE;
          const height = durationMinutes * PX_PER_MINUTE;
          const startSlot = toSlot(startMinuteOfDay);
          if (startSlot < 0 || startSlot >= 24 * 6) {
            return null;
          }
          const job = jobsById.get(segment.jobId);
          return {
            id: segment.id,
            jobId: segment.jobId,
            title: job?.customerName ?? 'Unknown customer',
            subtitle: job?.town ?? 'Unknown town',
            state: job?.derivedState ?? 'TBS',
            startLabel: minuteToLabel(startMinuteOfDay),
            endLabel: minuteToLabel(endMinuteOfDay),
            scheduledHoursLabel: job?.scheduledEffectiveHours ?? '-',
            remainingHoursLabel: job?.remainingHours ?? '-',
            jobStateLabel: job?.derivedState ?? 'TBS',
            topPx: top,
            heightPx: height,
            startMinuteOfDay,
            endMinuteOfDay,
            hasConflict:
              !!job &&
              conflicts.some(
                (conflict) =>
                  (conflict.type === 'EQUIPMENT_DOUBLE_BOOKING' || conflict.type === 'JOB_OVERLAP') &&
                  conflict.foreman_ids.includes(foreman.id) &&
                  conflict.affected_entities.some((entity) => entity.id === segment.jobId || entity.type === 'RESOURCE'),
              ),
          };
        })
          .filter((block) => block !== null) as ScheduleBlockData[];

        const travelBlocks = dayData.travel
          .map((segment) => {
          const startMinuteOfDay = minuteOfDay(segment.startDatetime);
          const endMinuteOfDay = minuteOfDay(segment.endDatetime);
          const durationMinutes = endMinuteOfDay - startMinuteOfDay;
          if (durationMinutes <= 0) {
            return null;
          }
          const top = (startMinuteOfDay - DAY_START_MINUTE) * PX_PER_MINUTE;
          const height = durationMinutes * PX_PER_MINUTE;
          const startSlot = toSlot(startMinuteOfDay);
          if (startSlot < 0 || startSlot >= 24 * 6) {
            return null;
          }
          return {
            id: segment.id,
            title: 'Travel',
            subtitle: '',
            state: 'TRAVEL',
            startLabel: minuteToLabel(startMinuteOfDay),
            endLabel: minuteToLabel(endMinuteOfDay),
            scheduledHoursLabel: '-',
            remainingHoursLabel: '-',
            jobStateLabel: 'Travel',
            travelLabel: segment.travelType.replaceAll('_', ' '),
            topPx: top,
            heightPx: height,
            startMinuteOfDay,
            endMinuteOfDay,
            hasConflict: false,
          };
        })
          .filter((block) => block !== null) as ScheduleBlockData[];

        return {
          foreman,
          dayData,
          blocks: [...scheduleBlocks, ...travelBlocks].sort((a, b) => a.topPx - b.topPx),
        };
      }),
    [companyTimezone, conflicts, dataByForeman, foremen, jobsById],
  );

  const conflictCounts = useMemo(() => {
    const unresolved = conflicts.filter((conflict) => {
      const key = `${conflict.type}:${conflict.affected_entities[0]?.id ?? conflict.message}`;
      return !dismissedConflictKeys.has(key);
    });
    return {
      errors: unresolved.filter((conflict) => conflict.severity === 'ERROR').length,
      warnings: unresolved.filter((conflict) => conflict.severity === 'WARNING').length,
      all: conflicts,
    };
  }, [conflicts, dismissedConflictKeys]);


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
        roster = await createForemanRoster(foremanId, { date: selectedDate, homeBaseId: defaultHomeBase.id });
      }

      const result = await createScheduleAttempt({
        jobId: input.jobId,
        foremanPersonId: foremanId,
        date: selectedDate,
        requestedStartMinute: selectedSlot.minute,
        durationMinutes: input.durationMinutes,
        companyTimezone,
        rosterId: roster.id,
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
            );
          } catch {
            warnings.push('Travel after block could not be created.');
          }
        }

        if (warnings.length > 0) {
          setPanelWarnings(warnings);
        }
      }

      await Promise.all([reloadForemanDay(foremanId, selectedDate), reloadJobs()]);

      const mappedWarnings = (result.warnings ?? []).map(
        (warning) => WARNING_MESSAGES[warning.code] ?? warning.message,
      );
      setPanelWarnings(mappedWarnings);
      setInlineCreationWarnings(mappedWarnings);
    } catch (scheduleError) {
      setPanelRejection(getErrorMessage(scheduleError));
    } finally {
      setPanelSubmitting(false);
    }
  }

  function handleRemoveSegment(foremanId: string, segmentId: string) {
    setPendingRemove({ foremanId, segmentId });
  }

  async function confirmRemoveSegment() {
    if (!pendingRemove) return;
    const { foremanId, segmentId } = pendingRemove;
    setPendingRemove(null);
    const response = await removeScheduleSegment(segmentId);
    await Promise.all([reloadForemanDay(foremanId, selectedDate), reloadJobs()]);
    await reloadOpenPushupSlots();
    if (response.vacatedSlotId) {
      if (pushupOpenTimerRef.current) {
        clearTimeout(pushupOpenTimerRef.current);
      }
      pushupOpenTimerRef.current = setTimeout(() => {
        setActivePushupSlotId(response.vacatedSlotId ?? null);
      }, 800);
    }
  }

  function setDate(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', date);
    router.push(`/dispatch?${params.toString()}`);
  }

  if (loading) {
    return (
      <main className="bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-[1600px] space-y-3">
          <div className="h-10 animate-pulse rounded bg-slate-200" />
          <div className="h-[560px] animate-pulse rounded bg-slate-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispatch</h1>
            <p className="text-sm text-slate-500">{formatDateHeading(selectedDate)}</p>
            <button
              type="button"
              onClick={() => setConflictsOpen((open) => !open)}
              aria-pressed={conflictsOpen}
              aria-label={`Toggle conflict panel. ${conflictCounts.errors + conflictCounts.warnings} conflicts`}
              className={`mt-2 rounded-md px-2 py-1 text-xs font-medium ${
                conflictCounts.errors > 0
                  ? 'bg-red-100 text-red-700'
                  : conflictCounts.warnings > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              Conflicts: {conflictCounts.errors + conflictCounts.warnings}
            </button>
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
            <button
              type="button"
              onClick={() => {
                if (openPushupSlotIds.length > 0) {
                  setActivePushupSlotId(openPushupSlotIds[0]);
                }
              }}
              disabled={openPushupSlotIds.length === 0}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                openPushupSlotIds.length > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              Show push-up suggestions {openPushupSlotIds.length > 0 ? `(${openPushupSlotIds.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setPrintDialogOpen(true)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              Print Schedule
            </button>
          </div>
        </div>

        {inlineCreationWarnings
          .filter((message) => !dismissedInlineWarnings.has(message))
          .map((message) => (
            <div
              key={message}
              className="mb-2 flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              <span>{message}</span>
              <button
                type="button"
                onClick={() =>
                  setDismissedInlineWarnings((current) => {
                    const next = new Set(current);
                    next.add(message);
                    return next;
                  })
                }
                className="rounded border border-amber-300 px-2 py-0.5 text-xs text-amber-800"
              >
                Dismiss
              </button>
            </div>
          ))}

        {error ? <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {diagnosticsOpen ? (
          <section className="mb-3 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <p>Timezone: {companyTimezone}</p>
            <p>Foremen loaded: {foremen.length}</p>
            <p>Jobs loaded: {jobs.length}</p>
          </section>
        ) : null}

        {conflictsOpen ? (
          <section className="mb-3 rounded-md border border-slate-200 bg-white p-3 text-sm">
            <h2 className="font-semibold text-slate-900">Conflict Summary</h2>
            {conflictCounts.all.length === 0 ? (
              <p className="mt-2 text-slate-600">No active conflicts for this date.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {conflictCounts.all.map((conflict, index) => {
                  const conflictKey = `${conflict.type}:${conflict.affected_entities[0]?.id ?? conflict.message}`;
                  const dismissed = dismissedConflictKeys.has(conflictKey);
                  return (
                    <li
                      key={`${conflict.type}-${index}`}
                      className={`rounded border px-3 py-2 ${
                        dismissed ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                            conflict.severity === 'ERROR'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {conflict.type}
                        </span>
                        {!dismissed ? (
                          <button
                            type="button"
                            className="text-xs text-slate-600 underline"
                            onClick={() =>
                              dismissDispatchConflict({
                                conflictType: conflict.type,
                                conflictKey: conflict.affected_entities[0]?.id ?? conflict.message,
                              })
                            }
                          >
                            Dismiss
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1">{conflict.message}</p>
                      {conflict.affected_entities.length > 0 ? (
                        <p className="mt-1 text-xs">
                          Affected:{' '}
                          {conflict.affected_entities.map((entity) => entity.name).join(', ')}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}

        {devtoolsEnabled ? (
          <section className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Dev tools enabled via <code>?devtools=true</code>.
          </section>
        ) : null}

        <section
          ref={scrollerRef}
          className="h-[calc(100vh-200px)] overflow-x-auto overflow-y-auto rounded-lg border border-slate-200/80 bg-white shadow-sm"
        >
          {columns.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-base font-medium text-slate-400">No jobs scheduled</p>
                <p className="mt-1 text-sm text-slate-400">No foreman rosters exist for this date.</p>
              </div>
            </div>
          ) : null}
          {/* Shared sticky header row — consistent fixed height for all columns */}
          <div className={`sticky top-0 z-20 flex border-b border-slate-200 bg-white ${columns.length === 0 ? 'hidden' : ''}`}>
            <div className="w-16 flex-none border-r border-slate-200" />
            <div className="flex flex-1">
              {columns.map(({ foreman, dayData }) => {
                const crewText =
                  dayData.crew.length > 0
                    ? dayData.crew.map((m) => m.resourceName).join(', ')
                    : 'No crew assigned';
                const crewTooltip =
                  dayData.crew.length > 0
                    ? dayData.crew.map((m) => `${m.resourceName} – ${m.role}`).join('\n')
                    : 'No crew assigned';
                return (
                  <div
                    key={`header-${foreman.id}`}
                    className="relative flex-1 min-w-[160px] border-l border-slate-200 first:border-l-0 p-2 h-[76px]"
                  >
                    <p
                      className="text-sm font-semibold text-slate-900 truncate"
                      title={foreman.name}
                    >
                      {foreman.name}
                    </p>
                    <p
                      className="mt-0.5 text-xs text-slate-500 truncate"
                      title={crewTooltip}
                    >
                      {crewText}
                    </p>
                    <button
                      type="button"
                      className="mt-1 cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900"
                      onClick={() =>
                        setAddCrewForemanId((current) =>
                          current === foreman.id ? null : foreman.id,
                        )
                      }
                    >
                      + Add Crew
                    </button>
                    {addCrewForemanId === foreman.id ? (
                      <div className="absolute left-0 top-[76px] z-30 w-72 rounded-b-md border border-slate-200 bg-white shadow-lg">
                        <CrewAddPanel
                          people={people.map((person) => ({ id: person.id, name: person.name }))}
                          busy={crewBusyForemanId === foreman.id}
                          error={crewErrorByForeman[foreman.id] ?? null}
                          onSubmit={(input) => handleAddCrew(foreman.id, input)}
                          onCancel={() => setAddCrewForemanId(null)}
                          homeBaseOptions={homeBases.map((hb) => ({ id: hb.id, name: hb.name }))}
                          requireHomeBaseChoice={dayData.roster === null && homeBases.length > 1}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time axis + foreman grids */}
          <div className={`flex ${columns.length === 0 ? 'hidden' : ''}`}>
            <aside
              className="w-16 shrink-0 border-r border-slate-200 bg-white"
            >
              {axisRows}
            </aside>
            <div className="flex flex-1">
              {columns.map(({ foreman, blocks }) => (
                <ForemanColumn
                  key={foreman.id}
                  foremanId={foreman.id}
                  blocks={blocks}
                  onSelectMinute={(input) => setSelectedSlot(input)}
                  onRemoveSegment={(segmentId) => handleRemoveSegment(foreman.id, segmentId)}
                  onJobSaved={async () => {
                    await Promise.all([reloadForemanDay(foreman.id, selectedDate), reloadJobs()]);
                  }}
                  salesRepCodes={salesRepCodes}
                  scrollContainerRef={scrollerRef}
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
      <PushupModal
        open={activePushupSlotId !== null}
        vacatedSlotId={activePushupSlotId}
        companyTimezone={companyTimezone}
        onClose={() => setActivePushupSlotId(null)}
        onApplied={async () => {
          await Promise.all([
            ...foremen.map((foreman) => reloadForemanDay(foreman.id, selectedDate)),
            reloadJobs(),
            reloadOpenPushupSlots(),
          ]);
        }}
      />
      <PrintDialog
        open={printDialogOpen}
        selectedDate={selectedDate}
        foremen={foremen}
        homeBases={homeBases}
        dataByForeman={dataByForeman}
        onClose={() => setPrintDialogOpen(false)}
      />
      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove segment"
        message="Remove this segment from the schedule?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => void confirmRemoveSegment()}
        onCancel={() => setPendingRemove(null)}
      />
    </main>
  );
}
