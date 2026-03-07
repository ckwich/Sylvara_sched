import { auth } from '@/auth';
import SummClient from './summ-client';

export default async function SummReportPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'VIEWER';
  const canEditSalesPerDay = role === 'MANAGER' || role === 'SCHEDULER';

  return <SummClient canEditSalesPerDay={canEditSalesPerDay} />;
}
