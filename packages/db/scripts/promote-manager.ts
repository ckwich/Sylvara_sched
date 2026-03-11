#!/usr/bin/env tsx
/**
 * promote-manager.ts
 *
 * CLI bootstrap script to promote one or more users to the MANAGER role.
 *
 * Usage:
 *   npx tsx packages/db/scripts/promote-manager.ts <email> [email2 ...]
 *
 * For each email address supplied:
 *   1. Sets `role = 'MANAGER'` in the local database.
 *   2. Syncs the Clerk publicMetadata (`{ userId, role }`) so future
 *      session tokens carry the correct claims.  If Clerk is unreachable
 *      (e.g. no CLERK_SECRET_KEY in env), the DB update still commits and
 *      a warning is printed.
 *
 * Requires DATABASE_URL in the environment (or a .env file loaded by the
 * caller).  CLERK_SECRET_KEY is optional but recommended.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncClerkMetadata(clerkId: string, userId: string): Promise<boolean> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('  [WARN] CLERK_SECRET_KEY not set — skipping Clerk metadata sync.');
    return false;
  }

  try {
    // Dynamic import so the script doesn't hard-fail if @clerk/backend
    // isn't installed in the db package (it lives in apps/api).
    const { createClerkClient } = await import('@clerk/backend');
    const clerk = createClerkClient({ secretKey });
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: { userId, role: 'MANAGER' },
    });
    return true;
  } catch (err) {
    console.warn(
      '  [WARN] Clerk metadata sync failed:',
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}

async function promoteEmail(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  console.log(`\nPromoting ${normalizedEmail} ...`);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, role: true, clerkId: true, active: true },
  });

  if (!user) {
    console.error(`  [ERROR] No user found with email ${normalizedEmail}.`);
    return;
  }

  if (!user.active) {
    console.error(`  [ERROR] User ${normalizedEmail} is inactive. Activate them first.`);
    return;
  }

  if (user.role === 'MANAGER') {
    console.log(`  Already MANAGER — no DB update needed.`);
  } else {
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role: 'MANAGER' },
    });
    console.log(`  DB role updated: ${user.role} -> MANAGER`);
  }

  if (user.clerkId) {
    const synced = await syncClerkMetadata(user.clerkId, user.id);
    if (synced) {
      console.log('  Clerk publicMetadata synced.');
    }
  } else {
    console.warn('  [WARN] No clerkId on user record — Clerk sync skipped.');
  }
}

async function main(): Promise<void> {
  const emails = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

  if (emails.length === 0) {
    console.error('Usage: npx tsx packages/db/scripts/promote-manager.ts <email> [email2 ...]');
    process.exit(1);
  }

  for (const email of emails) {
    await promoteEmail(email);
  }

  console.log('\nDone.');
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
