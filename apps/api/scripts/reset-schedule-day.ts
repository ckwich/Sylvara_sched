import { prisma } from '@sylvara/db';

type Args = {
  date: string;
  foremanPersonId: string;
  jobId?: string;
  dryRun: boolean;
  includeTravel: boolean;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {
    dryRun: false,
    includeTravel: false,
  };

  for (const arg of argv) {
    if (arg === '--dryRun') {
      out.dryRun = true;
      continue;
    }
    if (arg === '--includeTravel') {
      out.includeTravel = true;
      continue;
    }
    if (arg.startsWith('--date=')) {
      out.date = arg.slice('--date='.length);
      continue;
    }
    if (arg.startsWith('--foremanPersonId=')) {
      out.foremanPersonId = arg.slice('--foremanPersonId='.length);
      continue;
    }
    if (arg.startsWith('--jobId=')) {
      out.jobId = arg.slice('--jobId='.length);
      continue;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('reset-schedule-day is disabled in production.');
  }

  if (!out.date || !/^\d{4}-\d{2}-\d{2}$/.test(out.date)) {
    throw new Error('Missing or invalid --date (expected YYYY-MM-DD).');
  }

  if (!out.foremanPersonId || !UUID_RE.test(out.foremanPersonId)) {
    throw new Error('Missing or invalid --foremanPersonId (expected UUID).');
  }

  if (out.jobId !== undefined && !UUID_RE.test(out.jobId)) {
    throw new Error('Invalid --jobId (expected UUID).');
  }

  return out as Args;
}

function toDateOnlyUtc(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serviceDate = toDateOnlyUtc(args.date);

  const rosters = await prisma.foremanDayRoster.findMany({
    where: {
      foremanPersonId: args.foremanPersonId,
      date: serviceDate,
    },
    select: { id: true },
  });
  const rosterIds = rosters.map((r) => r.id);

  const links = rosterIds.length
    ? await prisma.segmentRosterLink.findMany({
        where: {
          rosterId: { in: rosterIds },
          ...(args.jobId !== undefined
            ? {
                scheduleSegment: {
                  jobId: args.jobId,
                },
              }
            : {}),
        },
        select: { id: true, scheduleSegmentId: true, rosterId: true },
      })
    : [];

  const linkIds = links.map((l) => l.id);
  const segmentIds = [...new Set(links.map((l) => l.scheduleSegmentId))];

  const travelToClear = args.includeTravel
    ? await prisma.travelSegment.findMany({
        where: {
          foremanPersonId: args.foremanPersonId,
          serviceDate,
          deletedAt: null,
        },
        select: { id: true },
      })
    : [];

  console.log('[reset-schedule-day] target summary');
  console.log(`  date: ${args.date}`);
  console.log(`  foremanPersonId: ${args.foremanPersonId}`);
  console.log(`  jobId: ${args.jobId ?? 'ALL'}`);
  console.log(`  rosterIds: ${rosterIds.length ? rosterIds.join(', ') : '(none)'}`);
  console.log(`  segmentRosterLink ids: ${linkIds.length ? linkIds.join(', ') : '(none)'}`);
  console.log(`  scheduleSegment ids: ${segmentIds.length ? segmentIds.join(', ') : '(none)'}`);
  if (args.includeTravel) {
    console.log(
      `  travelSegment ids: ${travelToClear.length ? travelToClear.map((t) => t.id).join(', ') : '(none)'}`,
    );
  }

  if (args.dryRun) {
    console.log('[reset-schedule-day] dry run complete; no changes were written.');
    return;
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const deletedLinks =
      linkIds.length > 0
        ? await tx.segmentRosterLink.deleteMany({
            where: { id: { in: linkIds } },
          })
        : { count: 0 };

    const softDeletedSegments =
      segmentIds.length > 0
        ? await tx.scheduleSegment.updateMany({
            where: {
              id: { in: segmentIds },
              deletedAt: null,
            },
            data: { deletedAt: now },
          })
        : { count: 0 };

    const softDeletedTravel =
      args.includeTravel && travelToClear.length > 0
        ? await tx.travelSegment.updateMany({
            where: {
              id: { in: travelToClear.map((t) => t.id) },
              deletedAt: null,
            },
            data: { deletedAt: now },
          })
        : { count: 0 };

    return {
      deletedLinks: deletedLinks.count,
      softDeletedSegments: softDeletedSegments.count,
      softDeletedTravel: softDeletedTravel.count,
    };
  });

  console.log('[reset-schedule-day] complete');
  console.log(`  deleted segment_roster_links: ${result.deletedLinks}`);
  console.log(`  soft-deleted schedule_segments: ${result.softDeletedSegments}`);
  if (args.includeTravel) {
    console.log(`  soft-deleted travel_segments: ${result.softDeletedTravel}`);
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[reset-schedule-day] failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
