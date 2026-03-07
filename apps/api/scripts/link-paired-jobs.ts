import { EquipmentType, PrismaClient } from '@prisma/client';

type UnresolvedDetail = {
  jobId: string;
  customer: string;
  address: string;
};

type AmbiguousDetail = UnresolvedDetail & { matchCount: number };

type LinkResult = {
  linked: number;
  unresolved: number;
  ambiguous: number;
  details: {
    unresolved: UnresolvedDetail[];
    ambiguous: AmbiguousDetail[];
  };
};

async function linkPairedJobs(prisma: PrismaClient): Promise<LinkResult> {
  const jobs = await prisma.job.findMany({
    where: {
      deletedAt: null,
      linkedEquipmentNote: { not: null },
    },
    select: {
      id: true,
      linkedJobId: true,
      linkedEquipmentNote: true,
      equipmentType: true,
      jobSiteAddress: true,
      town: true,
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  let linked = 0;
  const unresolved: UnresolvedDetail[] = [];
  const ambiguous: AmbiguousDetail[] = [];

  for (const job of jobs) {
    if (job.linkedJobId) {
      continue;
    }

    const opposite = job.equipmentType === EquipmentType.CRANE ? EquipmentType.BUCKET : EquipmentType.CRANE;

    const matches = await prisma.job.findMany({
      where: {
        deletedAt: null,
        linkedJobId: null,
        id: { not: job.id },
        equipmentType: opposite,
        jobSiteAddress: job.jobSiteAddress,
        town: job.town,
      },
      select: { id: true },
    });

    if (matches.length === 0) {
      unresolved.push({
        jobId: job.id,
        customer: job.customer.name,
        address: `${job.jobSiteAddress}, ${job.town}`,
      });
      continue;
    }

    if (matches.length > 1) {
      ambiguous.push({
        jobId: job.id,
        customer: job.customer.name,
        address: `${job.jobSiteAddress}, ${job.town}`,
        matchCount: matches.length,
      });
      continue;
    }

    const counterpartId = matches[0].id;
    await prisma.$transaction([
      prisma.job.update({ where: { id: job.id }, data: { linkedJobId: counterpartId } }),
      prisma.job.update({ where: { id: counterpartId }, data: { linkedJobId: job.id } }),
    ]);
    linked += 1;
  }

  return {
    linked,
    unresolved: unresolved.length,
    ambiguous: ambiguous.length,
    details: {
      unresolved,
      ambiguous,
    },
  };
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await linkPairedJobs(prisma);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

export { linkPairedJobs };
