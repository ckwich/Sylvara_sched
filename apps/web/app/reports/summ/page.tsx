import { auth } from '@clerk/nextjs/server';
import SummClient from './summ-client';

export default async function SummReportPage() {
  const { sessionClaims } = await auth();
  const role =
    (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? 'VIEWER';
  const canEditSalesPerDay = role === 'MANAGER' || role === 'SCHEDULER';

  return <SummClient canEditSalesPerDay={canEditSalesPerDay} />;
}
