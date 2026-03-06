import { redirect } from 'next/navigation';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import DispatchCalendar from './dispatch-calendar';

function todayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export default async function DispatchPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; devtools?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const date = resolvedSearchParams?.date;
  if (!date) {
    redirect(`/dispatch?date=${todayInTimezone(DEFAULT_TIMEZONE)}`);
  }

  return <DispatchCalendar initialDate={date} />;
}
