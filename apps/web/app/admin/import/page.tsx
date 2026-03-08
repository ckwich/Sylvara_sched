import { auth } from '@/auth';
import Link from 'next/link';
import ImportSummaryClient from './summary-client';

export default async function AdminImportPage() {
  const session = await auth();
  const role = session?.user?.role ?? null;

  if (role !== 'MANAGER') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Import Summary</h1>
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Manager permissions are required to view this page.
        </p>
        <Link href="/admin" className="mt-3 inline-block text-sm text-blue-700 underline">
          Back to Admin
        </Link>
      </main>
    );
  }

  return <ImportSummaryClient />;
}
