import cron from 'node-cron';
import type { PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, utcToLocalParts } from '@sylvara/shared';
import { captureSnapshot } from '../services/snapshot-service.js';

type SnapshotJobDeps = {
  prisma: PrismaClient;
  logInfo: (message: string) => void;
  logError: (message: string, error?: unknown) => void;
};

function localWeekday(parts: { year: number; month: number; day: number }): number {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

export function startWeeklySnapshotJob(deps: SnapshotJobDeps): () => void {
  let lastRunDateKey: string | null = null;

  const task = cron.schedule('* * * * *', async () => {
    try {
      const settings = await deps.prisma.orgSettings.findFirst({
        where: { deletedAt: null },
        select: { companyTimezone: true },
      });
      const timezone = settings?.companyTimezone ?? DEFAULT_TIMEZONE;
      const now = new Date();
      const localNow = utcToLocalParts(now, timezone);
      const isSunday = localWeekday(localNow) === 0;
      const isSixAM = localNow.hour === 6 && localNow.minute === 0;
      if (!isSunday || !isSixAM) {
        return;
      }

      const runDateKey = `${localNow.year}-${String(localNow.month).padStart(2, '0')}-${String(localNow.day).padStart(2, '0')}`;
      if (lastRunDateKey === runDateKey) {
        return;
      }
      lastRunDateKey = runDateKey;

      const result = await captureSnapshot(deps.prisma, now);
      if (result.status === 'CREATED') {
        deps.logInfo(
          `[weekly-snapshot-job] CREATED snapshot for ${result.snapshot_date} rows=${result.counts.totalRows}`,
        );
      } else {
        deps.logInfo(
          `[weekly-snapshot-job] DUPLICATE snapshot for ${result.snapshot_date} existing=${result.existingSnapshotDate}`,
        );
      }
    } catch (error) {
      deps.logError('[weekly-snapshot-job] failed', error);
    }
  });

  return () => {
    task.stop();
    task.destroy();
  };
}
