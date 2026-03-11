import { Prisma, RequirementStatus, type PrismaClient } from '@prisma/client';
import { minuteFromLegacyTime, utcToLocalParts } from '@sylvara/shared';
import { computeScheduledEffectiveHours } from '../scheduling/job-state.js';

export type PushupCandidate = {
  jobId: string;
  customerId: string;
  customerName: string;
  jobSiteAddress: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  craneModelSuitability: 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null;
  estimateHoursCurrent: number;
  remainingHours: number;
  allocatedHours: number;
  approvalDate: string | null;
  salesRepCode: string;
  winterFlag: boolean;
  frozenGroundFlag: boolean;
  activeBlockers: Array<{ id: string; reason: string; notes: string | null }>;
  requirements: Array<{ id: string; requirementType: string; status: RequirementStatus }>;
  frictionScore: number;
  tier: 1 | 2;
};

function decimalToNumber(value: Prisma.Decimal): number {
  return Number(value.toString());
}

function minutesOfLocalDate(utcDate: Date, timezone: string): number {
  const local = utcToLocalParts(utcDate, timezone);
  return local.hour * 60 + local.minute;
}

function isWithinPreferredWindow(input: {
  slotStart: Date;
  slotEnd: Date;
  timezone: string;
  preferredStartTime: Date | null;
  preferredEndTime: Date | null;
}): boolean {
  const slotStartMinute = minutesOfLocalDate(input.slotStart, input.timezone);
  const slotEndMinute = minutesOfLocalDate(input.slotEnd, input.timezone);

  if (input.preferredStartTime) {
    const preferredStartMinute = minuteFromLegacyTime(input.preferredStartTime);
    if (slotStartMinute < preferredStartMinute) {
      return false;
    }
  }

  if (input.preferredEndTime) {
    const preferredEndMinute = minuteFromLegacyTime(input.preferredEndTime);
    if (slotEndMinute > preferredEndMinute) {
      return false;
    }
  }

  return true;
}

export async function getCandidates(
  prisma: PrismaClient,
  vacatedSlotId: string,
): Promise<{ vacatedSlot: { id: string; startDatetime: Date; endDatetime: Date; slotHours: Prisma.Decimal; equipmentType: 'CRANE' | 'BUCKET'; status: 'OPEN' | 'USED' | 'DISMISSED' }; candidates: PushupCandidate[] } | null> {
  const [slot, orgSettings] = await Promise.all([
    prisma.vacatedSlot.findFirst({
      where: { id: vacatedSlotId, deletedAt: null },
      select: {
        id: true,
        startDatetime: true,
        endDatetime: true,
        slotHours: true,
        equipmentType: true,
        status: true,
      },
    }),
    prisma.orgSettings.findFirst({ where: { deletedAt: null }, select: { companyTimezone: true } }),
  ]);

  if (!slot) {
    console.log('[PUSHUP DEBUG] Vacated slot not found for id:', vacatedSlotId);
    return null;
  }

  const timezone = orgSettings?.companyTimezone ?? 'America/New_York';

  console.log('[PUSHUP DEBUG] ========== getCandidates START ==========');
  console.log('[PUSHUP DEBUG] Vacated slot parameters:');
  console.log('[PUSHUP DEBUG]   id:', slot.id);
  console.log('[PUSHUP DEBUG]   equipmentType:', slot.equipmentType);
  console.log('[PUSHUP DEBUG]   status:', slot.status);
  console.log('[PUSHUP DEBUG]   startDatetime:', slot.startDatetime.toISOString());
  console.log('[PUSHUP DEBUG]   endDatetime:', slot.endDatetime.toISOString());
  console.log('[PUSHUP DEBUG]   slotHours:', slot.slotHours.toString());
  console.log('[PUSHUP DEBUG]   timezone:', timezone);

  if (slot.status !== 'OPEN') {
    console.log('[PUSHUP DEBUG] Slot status is', slot.status, '— returning empty candidates');
    return {
      vacatedSlot: {
        id: slot.id,
        startDatetime: slot.startDatetime,
        endDatetime: slot.endDatetime,
        slotHours: slot.slotHours,
        equipmentType: slot.equipmentType,
        status: slot.status,
      },
      candidates: [],
    };
  }

  // --- Diagnostic: count jobs passing each individual filter (non-critical) ---
  try {
    const [countAll, countPushUp, countNotCompleted, countEquipMatch, countHasEstimate] = await Promise.all([
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null, pushUpIfPossible: true } }),
      prisma.job.count({ where: { deletedAt: null, pushUpIfPossible: true, completedDate: null } }),
      prisma.job.count({ where: { deletedAt: null, pushUpIfPossible: true, completedDate: null, equipmentType: slot.equipmentType } }),
      prisma.job.count({ where: { deletedAt: null, pushUpIfPossible: true, completedDate: null, equipmentType: slot.equipmentType, estimateHoursCurrent: { not: null } } }),
    ]);
    console.log('[PUSHUP DEBUG] Filter stage counts (cumulative):');
    console.log('[PUSHUP DEBUG]   All non-deleted jobs:', countAll);
    console.log('[PUSHUP DEBUG]   + pushUpIfPossible=true:', countPushUp);
    console.log('[PUSHUP DEBUG]   + completedDate=null (not completed):', countNotCompleted);
    console.log('[PUSHUP DEBUG]   + equipmentType=' + slot.equipmentType + ':', countEquipMatch);
    console.log('[PUSHUP DEBUG]   + estimateHoursCurrent IS NOT NULL:', countHasEstimate);
  } catch {
    console.log('[PUSHUP DEBUG] Diagnostic count queries skipped (prisma.job.count not available)');
  }

  const jobs = await prisma.job.findMany({
    where: {
      deletedAt: null,
      pushUpIfPossible: true,
      completedDate: null,
      equipmentType: slot.equipmentType,
      estimateHoursCurrent: { not: null },
    },
    select: {
      id: true,
      customerId: true,
      jobSiteAddress: true,
      town: true,
      equipmentType: true,
      craneModelSuitability: true,
      estimateHoursCurrent: true,
      approvalDate: true,
      salesRepCode: true,
      winterFlag: true,
      frozenGroundFlag: true,
      preferredStartTime: true,
      preferredEndTime: true,
      customer: { select: { name: true } },
      jobBlockers: {
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true, notes: true, blockerReason: { select: { label: true } } },
      },
      requirements: {
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          requirementType: { select: { label: true } },
        },
      },
    },
  });

  const jobIds = jobs.map((job) => job.id);
  const segments =
    jobIds.length === 0
      ? []
      : await prisma.scheduleSegment.findMany({
          where: {
            deletedAt: null,
            jobId: { in: jobIds },
          },
          select: {
            jobId: true,
            startDatetime: true,
            endDatetime: true,
            scheduledHoursOverride: true,
          },
        });

  const segmentsByJob = new Map<string, Array<{ startDatetime: Date; endDatetime: Date; scheduledHoursOverride: Prisma.Decimal | null }>>();
  for (const segment of segments) {
    const existing = segmentsByJob.get(segment.jobId) ?? [];
    existing.push({
      startDatetime: segment.startDatetime,
      endDatetime: segment.endDatetime,
      scheduledHoursOverride: segment.scheduledHoursOverride,
    });
    segmentsByJob.set(segment.jobId, existing);
  }

  console.log('[PUSHUP DEBUG] Jobs passing DB filters:', jobs.length);

  const slotHours = slot.slotHours;
  const candidates: Array<PushupCandidate & { _fitScore: number; _approvalSort: number }> = [];
  let skippedNullEstimate = 0;
  let skippedPreferredWindow = 0;
  let skippedRemainingZero = 0;

  for (const job of jobs) {
    if (!job.estimateHoursCurrent) {
      skippedNullEstimate++;
      continue;
    }

    const withinWindow = isWithinPreferredWindow({
      slotStart: slot.startDatetime,
      slotEnd: slot.endDatetime,
      timezone,
      preferredStartTime: job.preferredStartTime,
      preferredEndTime: job.preferredEndTime,
    });
    if (!withinWindow) {
      const slotStartMin = minutesOfLocalDate(slot.startDatetime, timezone);
      const slotEndMin = minutesOfLocalDate(slot.endDatetime, timezone);
      const prefStartMin = job.preferredStartTime ? minuteFromLegacyTime(job.preferredStartTime) : null;
      const prefEndMin = job.preferredEndTime ? minuteFromLegacyTime(job.preferredEndTime) : null;
      console.log(
        `[PUSHUP DEBUG] Job ${job.id} (${job.customer.name}) SKIPPED — preferred window mismatch: ` +
        `slot=[${slotStartMin}-${slotEndMin}] vs pref=[${prefStartMin ?? 'null'}-${prefEndMin ?? 'null'}]`,
      );
      skippedPreferredWindow++;
      continue;
    }

    const scheduledEffective = computeScheduledEffectiveHours({
      timezone,
      segments: segmentsByJob.get(job.id) ?? [],
    });

    let remaining = job.estimateHoursCurrent.sub(scheduledEffective);
    if (remaining.lt(0)) {
      remaining = new Prisma.Decimal(0);
    }
    if (remaining.lte(0)) {
      console.log(
        `[PUSHUP DEBUG] Job ${job.id} (${job.customer.name}) SKIPPED — remaining<=0: ` +
        `estimate=${job.estimateHoursCurrent.toString()}h, scheduled=${scheduledEffective.toString()}h`,
      );
      skippedRemainingZero++;
      continue;
    }

    const allocated = remaining.lte(slotHours) ? remaining : slotHours;
    const tier: 1 | 2 = remaining.lte(slotHours) ? 1 : 2;
    const fitScore = decimalToNumber(slotHours.sub(slotHours.sub(allocated).abs()));

    const unmetRequirements = job.requirements.filter(
      (requirement) =>
        requirement.status !== RequirementStatus.APPROVED &&
        requirement.status !== RequirementStatus.NOT_REQUIRED,
    );

    const frictionScore = job.jobBlockers.length + unmetRequirements.length;

    candidates.push({
      jobId: job.id,
      customerId: job.customerId,
      customerName: job.customer.name,
      jobSiteAddress: job.jobSiteAddress,
      town: job.town,
      equipmentType: job.equipmentType,
      craneModelSuitability: job.craneModelSuitability,
      estimateHoursCurrent: decimalToNumber(job.estimateHoursCurrent),
      remainingHours: decimalToNumber(remaining),
      allocatedHours: decimalToNumber(allocated),
      approvalDate: job.approvalDate ? job.approvalDate.toISOString().slice(0, 10) : null,
      salesRepCode: job.salesRepCode,
      winterFlag: job.winterFlag,
      frozenGroundFlag: job.frozenGroundFlag,
      activeBlockers: job.jobBlockers.map((blocker) => ({
        id: blocker.id,
        reason: blocker.blockerReason.label,
        notes: blocker.notes,
      })),
      requirements: unmetRequirements.map((requirement) => ({
        id: requirement.id,
        requirementType: requirement.requirementType.label,
        status: requirement.status,
      })),
      frictionScore,
      tier,
      _fitScore: fitScore,
      _approvalSort: job.approvalDate ? job.approvalDate.getTime() : Number.MAX_SAFE_INTEGER,
    });
  }

  console.log('[PUSHUP DEBUG] ---- Filter summary ----');
  console.log('[PUSHUP DEBUG]   Jobs from DB (all filters):', jobs.length);
  console.log('[PUSHUP DEBUG]   Skipped null estimate (post-query):', skippedNullEstimate);
  console.log('[PUSHUP DEBUG]   Skipped preferred window:', skippedPreferredWindow);
  console.log('[PUSHUP DEBUG]   Skipped remaining<=0:', skippedRemainingZero);
  console.log('[PUSHUP DEBUG]   Final candidates:', candidates.length);
  console.log('[PUSHUP DEBUG] ========== getCandidates END ==========');

  candidates.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    if (a._fitScore !== b._fitScore) {
      return b._fitScore - a._fitScore;
    }
    if (a._approvalSort !== b._approvalSort) {
      return a._approvalSort - b._approvalSort;
    }
    return a.frictionScore - b.frictionScore;
  });

  return {
    vacatedSlot: {
      id: slot.id,
      startDatetime: slot.startDatetime,
      endDatetime: slot.endDatetime,
      slotHours: slot.slotHours,
      equipmentType: slot.equipmentType,
      status: slot.status,
    },
    candidates: candidates.map(({ _fitScore, _approvalSort, ...candidate }) => candidate),
  };
}
