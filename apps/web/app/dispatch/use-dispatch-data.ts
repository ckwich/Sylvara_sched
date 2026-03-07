'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import {
  addForemanRosterMember,
  dismissConflict,
  createForemanRoster,
  getConflictDismissals,
  getConflicts,
  getForemanDaySchedule,
  getForemenSchedules,
  getForemanRosterMembers,
  getForemen,
  getHomeBases,
  getJobs,
  getOrgSettings,
  getResources,
  type DispatchForemanScheduleResponse,
  type DispatchConflict,
  type ForemanDayRoster,
  type HomeBaseRecord,
  type JobSummary,
  type ResourceRecord,
} from '../../lib/api';
import { getErrorMessage } from './dispatch-utils';

export type ForemanDayData = {
  roster: ForemanDayRoster | null;
  schedule: DispatchForemanScheduleResponse['scheduleSegments'];
  travel: NonNullable<DispatchForemanScheduleResponse['travelSegments']>;
  crew: Array<{ id: string; personResourceId: string; role: string; resourceName: string }>;
};

export function useDispatchData(selectedDate: string) {
  const [companyTimezone, setCompanyTimezone] = useState(DEFAULT_TIMEZONE);
  const [foremen, setForemen] = useState<ResourceRecord[]>([]);
  const [homeBases, setHomeBases] = useState<HomeBaseRecord[]>([]);
  const [people, setPeople] = useState<ResourceRecord[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [dataByForeman, setDataByForeman] = useState<Record<string, ForemanDayData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crewBusyForemanId, setCrewBusyForemanId] = useState<string | null>(null);
  const [crewErrorByForeman, setCrewErrorByForeman] = useState<Record<string, string | null>>({});
  const [conflicts, setConflicts] = useState<DispatchConflict[]>([]);
  const [dismissedConflictKeys, setDismissedConflictKeys] = useState<Set<string>>(new Set());

  async function loadDispatchData(date: string) {
    setLoading(true);
    setError(null);
    try {
      const [settings, foremenResponse, homeBaseResponse, resourcesResponse, jobsResponse] = await Promise.all([
        getOrgSettings(),
        getForemen(),
        getHomeBases(),
        getResources(),
        getJobs(),
      ]);
      const activeForemen = foremenResponse.foremen.filter((foreman) => foreman.active);
      setCompanyTimezone(settings.companyTimezone);
      setForemen(activeForemen);
      setHomeBases(homeBaseResponse.homeBases.filter((homeBase) => homeBase.active));
      setPeople(
        resourcesResponse.resources.filter(
          (resource) => resource.active && resource.resourceType === 'PERSON' && !resource.isForeman,
        ),
      );
      setJobs(jobsResponse.data);

      const [schedulesResponse, membersByForeman, conflictsResponse, dismissalsResponse] = await Promise.all([
        getForemenSchedules(
          date,
          activeForemen.map((foreman) => foreman.id),
        ),
        Promise.all(
          activeForemen.map(async (foreman) => [foreman.id, await getForemanRosterMembers(foreman.id, date)] as const),
        ),
        getConflicts(date),
        getConflictDismissals(date),
      ]);

      const membersMap = new Map(membersByForeman);
      const loaded = activeForemen.map((foreman) => {
        const schedule = schedulesResponse.schedules[foreman.id] ?? {
          roster: null,
          scheduleSegments: [],
          travelSegments: [],
        };
        const members = membersMap.get(foreman.id) ?? { members: [] };
          return [
            foreman.id,
            {
              roster: schedule.roster
                ? {
                    id: schedule.roster.id,
                    foremanPersonId: schedule.roster.foremanPersonId,
                    date: schedule.roster.date,
                    homeBaseId: schedule.roster.homeBaseId,
                    preferredStartMinute: schedule.roster.preferredStartMinute,
                    preferredEndMinute: schedule.roster.preferredEndMinute,
                    notes: null,
                  }
                : null,
              schedule: schedule.scheduleSegments,
              travel: schedule.travelSegments ?? [],
              crew: members.members,
            } satisfies ForemanDayData,
          ] as const;
      });

      setDataByForeman(Object.fromEntries(loaded));
      setConflicts(conflictsResponse.conflicts);
      setDismissedConflictKeys(
        new Set(dismissalsResponse.dismissals.map((dismissal) => `${dismissal.conflictType}:${dismissal.conflictKey}`)),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDispatchData(selectedDate);
  }, [selectedDate]);

  async function handleAddCrew(
    foremanId: string,
    input: { personResourceId: string; role: 'CLIMBER' | 'GROUND' | 'OPERATOR' | 'OTHER'; homeBaseId?: string },
  ) {
    setCrewBusyForemanId(foremanId);
    setCrewErrorByForeman((current) => ({ ...current, [foremanId]: null }));
    try {
      let roster = dataByForeman[foremanId]?.roster ?? null;
      if (!roster) {
        const baseId = input.homeBaseId ?? (homeBases.length === 1 ? homeBases[0].id : null);
        if (!baseId) {
          throw new Error('HOME_BASE_REQUIRED: Select a home base before adding crew.');
        }
        roster = await createForemanRoster(foremanId, { date: selectedDate, homeBaseId: baseId });
      }

      await addForemanRosterMember(
        foremanId,
        selectedDate,
        { personResourceId: input.personResourceId, role: input.role },
      );
      const members = await getForemanRosterMembers(foremanId, selectedDate);
      setDataByForeman((current) => ({
        ...current,
        [foremanId]: {
          ...(current[foremanId] ?? { roster: null, schedule: [], travel: [], crew: [] }),
          roster,
          crew: members.members,
        },
      }));
    } catch (addError) {
      setCrewErrorByForeman((current) => ({ ...current, [foremanId]: getErrorMessage(addError) }));
    } finally {
      setCrewBusyForemanId(null);
    }
  }

  async function reloadForemanDay(foremanId: string, date: string) {
    const [schedule, members] = await Promise.all([
      getForemanDaySchedule(foremanId, date),
      getForemanRosterMembers(foremanId, date),
    ]);

    setDataByForeman((current) => ({
      ...current,
      [foremanId]: {
        roster: schedule.roster
          ? {
              id: schedule.roster.id,
              foremanPersonId: schedule.roster.foremanPersonId,
              date: schedule.roster.date,
              homeBaseId: schedule.roster.homeBaseId,
              preferredStartMinute: schedule.roster.preferredStartMinute,
              preferredEndMinute: schedule.roster.preferredEndMinute,
              notes: null,
            }
          : null,
        schedule: schedule.scheduleSegments,
        travel: schedule.travelSegments ?? [],
        crew: members.members,
      },
    }));
  }

  async function reloadJobs() {
    const jobsResponse = await getJobs();
    setJobs(jobsResponse.data);
  }

  async function dismissDispatchConflict(input: { conflictType: string; conflictKey: string }) {
    await dismissConflict({
      date: selectedDate,
      conflictType: input.conflictType,
      conflictKey: input.conflictKey,
    });
    const dismissals = await getConflictDismissals(selectedDate);
    setDismissedConflictKeys(
      new Set(dismissals.dismissals.map((dismissal) => `${dismissal.conflictType}:${dismissal.conflictKey}`)),
    );
  }

  return {
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
    loadDispatchData,
    handleAddCrew,
    reloadForemanDay,
    reloadJobs,
    dismissDispatchConflict,
  };
}
