import cron from 'node-cron';
import type { PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, utcToLocalParts } from '@sylvara/shared';
import { captureSnapshot } from '../services/snapshot-service.js';

type SnapshotJobDeps = {
  prisma: PrismaClient;
  logInfo: (message: string) => void;
  logError: (message: string, error?: unknown) => void;
};

export function startWeeklySnapshotJob(deps: SnapshotJobDeps): () => void {
  let lastRunDateKey: string | null = null;

  const task = cron.schedule('0 6 * * 6', async () => {
    try {
      const settings = await deps.prisma.orgSettings.findFirst({
        where: { deletedAt: null },
        select: { companyTimezone: true },
      });
      const timezone = settings?.companyTimezone ?? DEFAULT_TIMEZONE;
      const now = new Date();
      const localNow = utcToLocalParts(now, timezone);

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
